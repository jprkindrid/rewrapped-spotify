package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/jprkindrid/rewrapped-spotify/internal/utils"

	"github.com/markbates/goth/gothic"
)

func (cfg *ApiConfig) HandlerLogin(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()

	if machineID := os.Getenv("FLY_MACHINE_ID"); machineID != "" {
		http.SetCookie(w, &http.Cookie{
			Name:     "fly-force-instance-id",
			Value:    machineID,
			Path:     "/",
			MaxAge:   300,
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteNoneMode,
		})
	}

	gothic.BeginAuthHandler(w, r)
}

func (cfg *ApiConfig) HandlerCallback(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()

	defer gothic.Logout(w, r)

	http.SetCookie(w, &http.Cookie{
		Name:     "fly-force-instance-id",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		log.Printf("[Callback] CompleteUserAuth error: %v", err)

		if strings.Contains(err.Error(), "403") {
			baseURL := strings.TrimSuffix(cfg.Env.Server.FrontendRedirectURL, "/upload")
			errorRedirectURL := fmt.Sprintf("%s/?error=not_whitelisted", baseURL)
			http.Redirect(w, r, errorRedirectURL, http.StatusSeeOther)
			return
		}

		utils.RespondWithError(w, http.StatusInternalServerError, "[Callback] Auth Error: "+err.Error(), err)
		return
	}

	authCode, err := cfg.AuthCodes.GenerateCodes(user.UserID, user.Name)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "[Callback] failed to generate auth code", err)
		return
	}

	redirectURL := fmt.Sprintf("%s?auth_code=%s", cfg.Env.Server.FrontendRedirectURL, authCode)
	http.Redirect(w, r, redirectURL, http.StatusSeeOther)
}
