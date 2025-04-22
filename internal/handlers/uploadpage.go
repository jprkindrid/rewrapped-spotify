package handlers

import (
	"log"
	"net/http"

	"github.com/markbates/goth/gothic"
)

func UploadPageHandler(w http.ResponseWriter, r *http.Request) {

	// Load the session with cookie options
	sess, err := gothic.Store.Get(r, gothic.SessionName)
	if err != nil {
		log.Printf("Session error: %v", err)
		http.Redirect(w, r, "/?error=session_expired", http.StatusFound)
		return
	}

	// Check authentication
	userID, ok := sess.Values["user_id"]
	if !ok || userID == nil {
		log.Printf("No valid user_id in session")
		http.Redirect(w, r, "/auth/spotify", http.StatusFound)
		return
	}

	// Refresh session max age on successful auth
	sess.Options.MaxAge = 3600 * 24 // 24 hours
	if err := sess.Save(r, w); err != nil {
		log.Printf("Error refreshing session: %v", err)
	}

	http.ServeFile(w, r, "./web/public/upload/index.html")
}
