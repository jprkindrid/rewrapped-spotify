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
	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
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

func (cfg *ApiConfig) HandlerUpdateEmail(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(constants.UserIDKey).(string)
	if !ok || userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return
	}

	var body updateEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	newEmail := strings.ToLower(strings.TrimSpace(body.NewEmail))
	password := body.Password

	if newEmail == "" || password == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "new email and password are required", nil)
		return
	}

	if _, err := mail.ParseAddress(newEmail); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid email format", err)
		return
	}

	dbUser, err := cfg.DB.GetUserByEmail(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithError(w, http.StatusUnauthorized, "user not found", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to load account", err)
		return
	}

	if err := auth.ComparePassword(dbUser.PasswordHash, password); err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			utils.RespondWithError(w, http.StatusUnauthorized, "incorrect password", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to verify credentials", err)
		return
	}

	updatedUser, err := cfg.DB.UpdateUserEmail(ctx, database.UpdateUserEmailParams{
		OldEmail: userID,
		NewEmail: newEmail,
	})
	if err != nil {
		if isUniqueConstraintError(err, "auth_users.email") {
			utils.RespondWithError(w, http.StatusConflict, "email already in use", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to update email", err)
		return
	}

	token, err := auth.GenerateJWT(updatedUser.Email, displayNameOrEmail(updatedUser), cfg.Env)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to create auth token", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, authResponse{Token: token})
}

func (cfg *ApiConfig) HandlerUpdatePassword(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(constants.UserIDKey).(string)
	if !ok || userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return
	}

	var body updatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	if body.CurrentPassword == "" || body.NewPassword == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "current password and new password are required", nil)
		return
	}

	if len(body.NewPassword) < minPasswordLength {
		utils.RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("new password must be at least %d characters", minPasswordLength), nil)
		return
	}

	dbUser, err := cfg.DB.GetUserByEmail(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithError(w, http.StatusUnauthorized, "user not found", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to load account", err)
		return
	}

	if err := auth.ComparePassword(dbUser.PasswordHash, body.CurrentPassword); err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			utils.RespondWithError(w, http.StatusUnauthorized, "incorrect current password", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to verify credentials", err)
		return
	}

	newHash, err := auth.HashPassword(body.NewPassword)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to process new password", err)
		return
	}

	if err := cfg.DB.UpdateUserPassword(ctx, database.UpdateUserPasswordParams{
		Email:        userID,
		PasswordHash: newHash,
	}); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to update password", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "password updated successfully"})
}

func (cfg *ApiConfig) HandlerUpdateDisplayName(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(constants.UserIDKey).(string)
	if !ok || userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return
	}

	var body updateDisplayNameRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	displayName := strings.TrimSpace(body.DisplayName)
	optionalDisplayName := sql.NullString{}
	if displayName != "" {
		optionalDisplayName = sql.NullString{String: displayName, Valid: true}
	}

	updatedUser, err := cfg.DB.UpdateDisplayName(ctx, database.UpdateDisplayNameParams{
		Email:       userID,
		DisplayName: optionalDisplayName,
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to update display name", err)
		return
	}

	token, err := auth.GenerateJWT(updatedUser.Email, displayNameOrEmail(updatedUser), cfg.Env)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to create auth token", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, authResponse{Token: token})
}
