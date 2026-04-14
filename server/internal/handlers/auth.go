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
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

const minPasswordLength = 8

type authRequest struct {
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
	Password    string `json:"password"`
}

type authResponse struct {
	Token string `json:"token"`
}

func (cfg *ApiConfig) HandlerRegister(w http.ResponseWriter, r *http.Request) {
	var body authRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	displayName := strings.TrimSpace(body.DisplayName)
	email := strings.ToLower(strings.TrimSpace(body.Email))
	password := body.Password

	if err := validateRegistrationInput(email, password); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	optionalDisplayName := sql.NullString{}
	if displayName != "" {
		optionalDisplayName = sql.NullString{String: displayName, Valid: true}
	}

	passwordHash, err := auth.HashPassword(password)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to process credentials", err)
		return
	}

	createdUser, err := cfg.DB.CreateUser(r.Context(), database.CreateUserParams{
		Email:        email,
		PasswordHash: passwordHash,
		DisplayName:  optionalDisplayName,
	})
	if err != nil {
		if isUniqueConstraintError(err, "auth_users.email") {
			utils.RespondWithError(w, http.StatusConflict, "email already exists", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to create account", err)
		return
	}

	token, err := auth.GenerateJWT(createdUser.Email, displayNameOrEmail(createdUser), cfg.Env)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to create auth token", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, authResponse{Token: token})
}

func (cfg *ApiConfig) HandlerLogin(w http.ResponseWriter, r *http.Request) {
	var body authRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "invalid request body", err)
		return
	}

	email := strings.ToLower(strings.TrimSpace(body.Email))
	password := body.Password

	if err := validateLoginInput(email, password); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	dbUser, err := cfg.DB.GetUserByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithError(w, http.StatusUnauthorized, "invalid email or password", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to load account", err)
		return
	}

	if err := auth.ComparePassword(dbUser.PasswordHash, password); err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			utils.RespondWithError(w, http.StatusUnauthorized, "invalid email or password", err)
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to verify credentials", err)
		return
	}

	token, err := auth.GenerateJWT(dbUser.Email, displayNameOrEmail(dbUser), cfg.Env)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to create auth token", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, authResponse{Token: token})
}

func isUniqueConstraintError(err error, key string) bool {
	if err == nil {
		return false
	}

	errMsg := strings.ToLower(err.Error())
	return strings.Contains(errMsg, "unique") && strings.Contains(errMsg, strings.ToLower(key))
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

func displayNameOrEmail(user database.User) string {
	if user.DisplayName.Valid {
		name := strings.TrimSpace(user.DisplayName.String)
		if name != "" {
			return name
		}
	}

	return user.Email
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
