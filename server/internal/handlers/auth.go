package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/jprkindrid/rewrapped-spotify/internal/auth"
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/email"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

const (
	minPasswordLength = 8

	// emailLinksPerAddress caps links sent to one address per emailLinkWindow,
	// so the endpoint can't be used to flood someone's inbox.
	emailLinksPerAddress = 3
	emailLinkWindow      = 15 * time.Minute

	// Shown whether or not an account exists, so the endpoint doesn't reveal
	// which emails are registered.
	emailLinkSentMessage = "If an account exists for that email, a link is on its way."
)

type authRequest struct {
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
	Password    string `json:"password"`
}

type authResponse struct {
	Token string `json:"token"`
}

type messageResponse struct {
	Message string `json:"message"`
}

func (cfg *ApiConfig) HandlerRegister(w http.ResponseWriter, r *http.Request) {
	var body authRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	email := normalizeEmail(body.Email)
	if err := validateRegistrationInput(email, body.Password); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	passwordHash, err := auth.HashPassword(body.Password)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to process credentials", err)
		return
	}

	createdUser, err := cfg.DB.CreateUser(r.Context(), database.CreateUserParams{
		ID:           uuid.New().String(),
		Email:        nullString(email),
		PasswordHash: nullString(passwordHash),
		DisplayName:  nullString(strings.TrimSpace(body.DisplayName)),
	})
	if err != nil {
		if isUniqueConstraintError(err, "users.email") {
			utils.RespondWithError(w, http.StatusConflict, "an account with this email already exists", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to create account", err)
		return
	}

	cfg.respondWithSession(w, http.StatusCreated, createdUser, auth.SessionOptions{})
}

func (cfg *ApiConfig) HandlerLogin(w http.ResponseWriter, r *http.Request) {
	var body authRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	email := normalizeEmail(body.Email)
	if err := validateLoginInput(email, body.Password); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	dbUser, err := cfg.DB.GetUserByEmail(r.Context(), nullString(email))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithError(w, http.StatusUnauthorized, "invalid email or password", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to load account", err)
		return
	}

	// Accounts made from an email link have no password. Same message as a
	// wrong password, so the response doesn't reveal which accounts exist.
	if !dbUser.PasswordHash.Valid || dbUser.PasswordHash.String == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "invalid email or password", nil)
		return
	}

	if err := auth.ComparePassword(dbUser.PasswordHash.String, body.Password); err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			utils.RespondWithError(w, http.StatusUnauthorized, "invalid email or password", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to verify credentials", err)
		return
	}

	cfg.respondWithSession(w, http.StatusOK, dbUser, auth.SessionOptions{})
}

// HandlerGuest starts a session with no account. Guest data is deleted after
// cfg.Time.GuestRetention unless the guest claims it with an email.
func (cfg *ApiConfig) HandlerGuest(w http.ResponseWriter, r *http.Request) {
	guest, err := cfg.DB.CreateGuestUser(r.Context(), database.CreateGuestUserParams{
		ID:             uuid.New().String(),
		GuestExpiresAt: sql.NullTime{Time: dbTime(time.Now().Add(cfg.Env.Time.GuestRetention)), Valid: true},
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to start guest session", err)
		return
	}

	cfg.respondWithSession(w, http.StatusCreated, guest, auth.SessionOptions{})
}

type authConfigResponse struct {
	EmailEnabled bool `json:"email_enabled"`
}

// HandlerAuthConfig tells the frontend which sign-in options to offer. Email
// features (sign-in links, password resets, confirming a guest's email) are
// hidden unless an email sender is configured.
func (cfg *ApiConfig) HandlerAuthConfig(w http.ResponseWriter, r *http.Request) {
	utils.RespondWithJSON(w, http.StatusOK, authConfigResponse{EmailEnabled: cfg.Email != nil})
}

// HandlerRefresh swaps a valid session token for a fresh one, so active users
// stay signed in.
func (cfg *ApiConfig) HandlerRefresh(w http.ResponseWriter, r *http.Request) {
	user, ok := cfg.sessionUser(w, r)
	if !ok {
		return
	}
	cfg.respondWithSession(w, http.StatusOK, user, auth.SessionOptions{})
}

type emailLinkRequest struct {
	Email   string `json:"email"`
	Purpose string `json:"purpose"`
}

// HandlerEmailLink emails a one-time sign-in or password-reset link. It
// answers the same way whether or not the account exists.
func (cfg *ApiConfig) HandlerEmailLink(w http.ResponseWriter, r *http.Request) {
	if cfg.Email == nil {
		utils.RespondWithError(w, http.StatusServiceUnavailable, "email sign-in isn't available right now", nil)
		return
	}

	var body emailLinkRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	address := normalizeEmail(body.Email)
	if _, err := mail.ParseAddress(address); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid email format", err)
		return
	}

	purpose := body.Purpose
	if purpose != auth.EmailPurposeLogin && purpose != auth.EmailPurposeReset {
		utils.RespondWithError(w, http.StatusBadRequest, "purpose must be login or reset", nil)
		return
	}

	ctx := r.Context()
	user, err := cfg.DB.GetUserByEmail(ctx, nullString(address))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusAccepted, messageResponse{Message: emailLinkSentMessage})
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to load account", err)
		return
	}

	if err := cfg.sendEmailLink(ctx, user.ID, address, purpose); err != nil {
		if errors.Is(err, errTooManyEmails) {
			utils.RespondWithError(w, http.StatusTooManyRequests, err.Error(), err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to send email", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusAccepted, messageResponse{Message: emailLinkSentMessage})
}

type verifyRequest struct {
	Token string `json:"token"`
}

type verifyResponse struct {
	Token   string `json:"token"`
	Purpose string `json:"purpose"`
}

// HandlerVerifyEmailLink redeems a link from HandlerEmailLink or a guest
// claim. It's a POST from the frontend rather than a GET on the link itself,
// so email scanners that prefetch links can't use them up.
func (cfg *ApiConfig) HandlerVerifyEmailLink(w http.ResponseWriter, r *http.Request) {
	var body verifyRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Token == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "missing token", err)
		return
	}

	ctx := r.Context()
	now := dbTime(time.Now())
	token, err := cfg.DB.ConsumeEmailToken(ctx, database.ConsumeEmailTokenParams{
		TokenHash: auth.HashEmailToken(body.Token),
		UsedAt:    sql.NullTime{Time: now, Valid: true},
		Now:       now,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithError(w, http.StatusBadRequest, "this link has expired or was already used", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to verify link", err)
		return
	}

	user, err := cfg.DB.GetUserByID(ctx, token.UserID)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "this link is no longer valid", err)
		return
	}

	var opts auth.SessionOptions
	switch token.Purpose {
	case auth.EmailPurposeLogin, auth.EmailPurposeReset:
		// The link was sent to the account's email; if that's changed since,
		// the link no longer proves anything.
		if !user.Email.Valid || user.Email.String != token.Email {
			utils.RespondWithError(w, http.StatusBadRequest, "this link is no longer valid", nil)
			return
		}
		opts.PasswordReset = token.Purpose == auth.EmailPurposeReset

	case auth.EmailPurposeClaim:
		if !user.IsGuest {
			utils.RespondWithError(w, http.StatusBadRequest, "this data has already been saved to an account", nil)
			return
		}
		user, err = cfg.DB.ClaimGuestUser(ctx, database.ClaimGuestUserParams{
			ID:    user.ID,
			Email: nullString(token.Email),
		})
		if err != nil {
			if isUniqueConstraintError(err, "users.email") {
				utils.RespondWithError(w, http.StatusConflict, "an account with this email already exists", err)
				return
			}
			utils.RespondWithError(w, http.StatusInternalServerError, "failed to save account", err)
			return
		}

	default:
		utils.RespondWithError(w, http.StatusBadRequest, "unknown link type", fmt.Errorf("purpose %q", token.Purpose))
		return
	}

	sessionToken, err := auth.GenerateSessionToken(user, cfg.Env, opts)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to create auth token", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, verifyResponse{Token: sessionToken, Purpose: token.Purpose})
}

var errTooManyEmails = errors.New("too many emails sent to this address, try again in a few minutes")

// sendEmailLink stores a one-time token for userID and emails a link to it.
func (cfg *ApiConfig) sendEmailLink(ctx context.Context, userID, address, purpose string) error {
	now := time.Now()

	recent, err := cfg.DB.CountRecentEmailTokens(ctx, database.CountRecentEmailTokensParams{
		Email: address,
		Since: dbTime(now.Add(-emailLinkWindow)),
	})
	if err != nil {
		return fmt.Errorf("failed to check email rate limit: %w", err)
	}
	if recent >= emailLinksPerAddress {
		return errTooManyEmails
	}

	expiry := cfg.Env.Time.LoginLinkExpiry
	if purpose == auth.EmailPurposeReset {
		expiry = cfg.Env.Time.ResetLinkExpiry
	}

	raw, hash, err := auth.NewEmailToken()
	if err != nil {
		return err
	}

	if err := cfg.DB.CreateEmailToken(ctx, database.CreateEmailTokenParams{
		TokenHash: hash,
		UserID:    userID,
		Purpose:   purpose,
		Email:     address,
		CreatedAt: dbTime(now),
		ExpiresAt: dbTime(now.Add(expiry)),
	}); err != nil {
		return fmt.Errorf("failed to store email token: %w", err)
	}

	link := strings.TrimRight(cfg.Env.Email.AppURL, "/") + "/auth/verify?token=" + raw
	expiryText := fmt.Sprintf("%d minutes", int(expiry.Minutes()))

	var msg email.Message
	switch purpose {
	case auth.EmailPurposeReset:
		msg = email.LinkMessage(address, "Reset your ReWrapped password",
			"Someone (hopefully you) asked to reset the password for your ReWrapped account.",
			"Reset password", link, expiryText)
	case auth.EmailPurposeClaim:
		msg = email.LinkMessage(address, "Confirm your email to save your ReWrapped data",
			"Confirm this email address to keep your uploaded listening history and turn your guest session into an account.",
			"Save my data", link, expiryText)
	default:
		msg = email.LinkMessage(address, "Your ReWrapped sign-in link",
			"Use this link to sign in to ReWrapped. No password needed.",
			"Sign in", link, expiryText)
	}

	if err := cfg.Email.Send(ctx, msg); err != nil {
		slog.Error("[EMAIL] send failed", "purpose", purpose, "error", err)
		return err
	}
	return nil
}

// sessionUser loads the user behind the request's session, responding with an
// error (and returning false) if that isn't possible.
func (cfg *ApiConfig) sessionUser(w http.ResponseWriter, r *http.Request) (database.User, bool) {
	userID, ok := r.Context().Value(constants.UserIDKey).(string)
	if !ok || userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return database.User{}, false
	}

	user, err := cfg.DB.GetUserByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithError(w, http.StatusUnauthorized, "user not found", err)
			return database.User{}, false
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to load account", err)
		return database.User{}, false
	}

	return user, true
}

func (cfg *ApiConfig) respondWithSession(w http.ResponseWriter, status int, user database.User, opts auth.SessionOptions) {
	token, err := auth.GenerateSessionToken(user, cfg.Env, opts)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to create auth token", err)
		return
	}
	utils.RespondWithJSON(w, status, authResponse{Token: token})
}

func isUniqueConstraintError(err error, key string) bool {
	if err == nil {
		return false
	}

	errMsg := strings.ToLower(err.Error())
	return strings.Contains(errMsg, "unique") && strings.Contains(errMsg, strings.ToLower(key))
}

func normalizeEmail(raw string) string {
	return strings.ToLower(strings.TrimSpace(raw))
}

func nullString(s string) sql.NullString {
	return sql.NullString{String: s, Valid: s != ""}
}

// dbTime normalises times written to and compared in the database: UTC,
// whole seconds, so they sort the same as text in SQLite.
func dbTime(t time.Time) time.Time {
	return t.UTC().Truncate(time.Second)
}

func validateRegistrationInput(email, password string) error {
	if email == "" || password == "" {
		return fmt.Errorf("email and password are required")
	}

	if _, err := mail.ParseAddress(email); err != nil {
		return fmt.Errorf("invalid email format")
	}

	if len(password) < minPasswordLength {
		return fmt.Errorf("password must be at least %d characters", minPasswordLength)
	}

	return nil
}

func validateLoginInput(email, password string) error {
	if email == "" || password == "" {
		return fmt.Errorf("email and password are required")
	}

	if _, err := mail.ParseAddress(email); err != nil {
		return fmt.Errorf("invalid email format")
	}

	return nil
}
