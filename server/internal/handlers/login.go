package handlers

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/markbates/goth/gothic"
)

func (cfg *ApiConfig) HandlerLogin(w http.ResponseWriter, r *http.Request) {

	session, _ := gothic.Store.Get(r, "user_session")
	gothic.Logout(w, r)

	session.Options.MaxAge = -1
	session.Save(r, w)

	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()

	gothic.BeginAuthHandler(w, r)
}

func (cfg *ApiConfig) HandlerCallback(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		log.Printf("[Callback] CompleteUserAuth error: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "[Callback] Auth Error: "+err.Error(), err)
		return
	}

	log.Printf("[Callback] User authenticated: %s", user.UserID)

	// Fix: Remove the deletion cookie that CompleteUserAuth adds
	cookies := w.Header()["Set-Cookie"]
	var validCookies []string
	for _, cookie := range cookies {
		// Keep only cookies that aren't deletion cookies (Max-Age=0)
		if !strings.Contains(cookie, "Max-Age=0") &&
			!strings.Contains(cookie, "Expires=Thu, 01 Jan 1970") {
			validCookies = append(validCookies, cookie)
		}
	}

	// Clear and re-add only valid cookies
	w.Header().Del("Set-Cookie")
	for _, cookie := range validCookies {
		w.Header().Add("Set-Cookie", cookie)
	}

	log.Printf("[Callback] Filtered to %d valid cookies", len(validCookies))

	frontendURL := os.Getenv("FRONTEND_REDIRECT_URL")
	http.Redirect(w, r, frontendURL, http.StatusSeeOther)
}

func (cfg *ApiConfig) HandlerLogout(w http.ResponseWriter, r *http.Request) {
	err := gothic.Logout(w, r)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error logging out", err)
	}
	http.Redirect(w, r, "/", http.StatusFound)
}
