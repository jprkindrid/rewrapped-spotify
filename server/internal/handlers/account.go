package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"strings"

	"github.com/jprkindrid/rewrapped-spotify/internal/auth"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/middleware"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

type updateEmailRequest struct {
	NewEmail string `json:"new_email"`
	Password string `json:"password"`
}

type updatePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

type updateDisplayNameRequest struct {
	DisplayName string `json:"display_name"`
}

type claimRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"display_name"`
}

// HandlerClaimGuest turns the current guest into an account, keeping their
// data. With a password it happens immediately; without one, a confirmation
// link is emailed and the claim completes when it's opened.
func (cfg *ApiConfig) HandlerClaimGuest(w http.ResponseWriter, r *http.Request) {
	user, ok := cfg.sessionUser(w, r)
	if !ok {
		return
	}
	if !user.IsGuest {
		utils.RespondWithError(w, http.StatusBadRequest, "this session already belongs to an account", nil)
		return
	}

	var body claimRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	address := normalizeEmail(body.Email)
	if _, err := mail.ParseAddress(address); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid email format", err)
		return
	}

	ctx := r.Context()

	// Claiming never takes over an existing account; that would let anyone
	// overwrite someone else's data by claiming with their email.
	if _, err := cfg.DB.GetUserByEmail(ctx, nullString(address)); err == nil {
		utils.RespondWithError(w, http.StatusConflict, "an account with this email already exists; log in and upload your files there instead", nil)
		return
	} else if !errors.Is(err, sql.ErrNoRows) {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to check email", err)
		return
	}

	if body.Password == "" {
		if cfg.Email == nil {
			utils.RespondWithError(w, http.StatusServiceUnavailable, "email confirmation isn't available right now; choose a password instead", nil)
			return
		}
		if err := cfg.sendEmailLink(ctx, user.ID, address, auth.EmailPurposeClaim); err != nil {
			if errors.Is(err, errTooManyEmails) {
				utils.RespondWithError(w, http.StatusTooManyRequests, err.Error(), err)
				return
			}
			utils.RespondWithError(w, http.StatusInternalServerError, "failed to send confirmation email", err)
			return
		}
		utils.RespondWithJSON(w, http.StatusAccepted, messageResponse{Message: "Check your email to confirm and save your data."})
		return
	}

	if len(body.Password) < minPasswordLength {
		utils.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("password must be at least %d characters", minPasswordLength), nil)
		return
	}

	passwordHash, err := auth.HashPassword(body.Password)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to process credentials", err)
		return
	}

	claimed, err := cfg.DB.ClaimGuestUser(ctx, database.ClaimGuestUserParams{
		ID:           user.ID,
		Email:        nullString(address),
		PasswordHash: nullString(passwordHash),
		DisplayName:  nullString(strings.TrimSpace(body.DisplayName)),
	})
	if err != nil {
		if isUniqueConstraintError(err, "users.email") {
			utils.RespondWithError(w, http.StatusConflict, "an account with this email already exists", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to save account", err)
		return
	}

	cfg.respondWithSession(w, http.StatusOK, claimed, auth.SessionOptions{})
}

func (cfg *ApiConfig) HandlerUpdateEmail(w http.ResponseWriter, r *http.Request) {
	user, ok := cfg.accountUser(w, r)
	if !ok {
		return
	}

	var body updateEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	newEmail := normalizeEmail(body.NewEmail)
	if newEmail == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "new email is required", nil)
		return
	}
	if _, err := mail.ParseAddress(newEmail); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid email format", err)
		return
	}

	// Without a password there's nothing to re-confirm the change with, and a
	// stolen session could quietly redirect sign-in links to a new address.
	if !hasPassword(user) {
		utils.RespondWithError(w, http.StatusBadRequest, "set a password before changing your email", nil)
		return
	}
	if !cfg.checkPassword(w, user, body.Password, "incorrect password") {
		return
	}

	updatedUser, err := cfg.DB.UpdateUserEmail(r.Context(), database.UpdateUserEmailParams{
		ID:    user.ID,
		Email: nullString(newEmail),
	})
	if err != nil {
		if isUniqueConstraintError(err, "users.email") {
			utils.RespondWithError(w, http.StatusConflict, "email already in use", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to update email", err)
		return
	}

	cfg.respondWithSession(w, http.StatusOK, updatedUser, auth.SessionOptions{})
}

// HandlerUpdatePassword sets a new password, signing out every other session.
// The current password isn't needed if the account has none yet, or if this
// session was opened from a password-reset link.
func (cfg *ApiConfig) HandlerUpdatePassword(w http.ResponseWriter, r *http.Request) {
	user, ok := cfg.accountUser(w, r)
	if !ok {
		return
	}

	var body updatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	if len(body.NewPassword) < minPasswordLength {
		utils.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("new password must be at least %d characters", minPasswordLength), nil)
		return
	}

	session, _ := middleware.SessionFromContext(r.Context())
	fromResetLink := session != nil && session.PasswordReset

	if hasPassword(user) && !fromResetLink {
		if body.CurrentPassword == "" {
			utils.RespondWithError(w, http.StatusBadRequest, "current password is required", nil)
			return
		}
		if !cfg.checkPassword(w, user, body.CurrentPassword, "incorrect current password") {
			return
		}
	}

	newHash, err := auth.HashPassword(body.NewPassword)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to process new password", err)
		return
	}

	updatedUser, err := cfg.DB.UpdateUserPassword(r.Context(), database.UpdateUserPasswordParams{
		ID:           user.ID,
		PasswordHash: nullString(newHash),
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to update password", err)
		return
	}

	// The update bumped token_version: other sessions are now revoked, and
	// this one needs a new token too.
	cfg.Sessions.Invalidate(user.ID)
	cfg.respondWithSession(w, http.StatusOK, updatedUser, auth.SessionOptions{})
}

func (cfg *ApiConfig) HandlerUpdateDisplayName(w http.ResponseWriter, r *http.Request) {
	user, ok := cfg.accountUser(w, r)
	if !ok {
		return
	}

	var body updateDisplayNameRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	updatedUser, err := cfg.DB.UpdateDisplayName(r.Context(), database.UpdateDisplayNameParams{
		ID:          user.ID,
		DisplayName: nullString(strings.TrimSpace(body.DisplayName)),
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to update display name", err)
		return
	}

	cfg.respondWithSession(w, http.StatusOK, updatedUser, auth.SessionOptions{})
}

// accountUser is sessionUser for endpoints guests can't use.
func (cfg *ApiConfig) accountUser(w http.ResponseWriter, r *http.Request) (database.User, bool) {
	user, ok := cfg.sessionUser(w, r)
	if !ok {
		return database.User{}, false
	}
	if user.IsGuest {
		utils.RespondWithError(w, http.StatusForbidden, "save your data to an account first", nil)
		return database.User{}, false
	}
	return user, true
}

func hasPassword(user database.User) bool {
	return user.PasswordHash.Valid && user.PasswordHash.String != ""
}

// checkPassword responds 401 with wrongMsg (or 500) and returns false unless
// password matches user's.
func (cfg *ApiConfig) checkPassword(w http.ResponseWriter, user database.User, password, wrongMsg string) bool {
	if password == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "password is required", nil)
		return false
	}
	if err := auth.ComparePassword(user.PasswordHash.String, password); err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			utils.RespondWithError(w, http.StatusUnauthorized, wrongMsg, err)
			return false
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to verify credentials", err)
		return false
	}
	return true
}
