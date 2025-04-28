package handlers

import (
	"log"
	"net/http"
	"path/filepath"

	"github.com/markbates/goth/gothic"
)

func UploadPageHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("[UploadPageHandler] Starting upload page handler")

	// Uncomment session debugging if needed
	// log.Printf("[UploadPageHandler] Cookies: %+v", r.Cookies())
	// log.Printf("[UploadPageHandler] Headers: %+v", r.Header)

	sess, err := gothic.Store.Get(r, gothic.SessionName)
	if err != nil {
		log.Printf("[UploadPageHandler] Session error: %v", err)
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	userID, ok := sess.Values["user_id"].(string)
	if !ok || userID == "" {
		log.Printf("[UploadPageHandler] No valid user_id in session")
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	log.Printf("[UploadPageHandler] Found valid user_id: %s", userID)

	// Note: Keep session.Save() here - it refreshes the expiry
	if err := sess.Save(r, w); err != nil {
		log.Printf("[UploadPageHandler] Error saving session: %v", err)
		// Continue anyway since we have a valid session
	}

	// Set security headers
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")

	http.ServeFile(w, r, filepath.Join("web", "static", "upload", "upload.html"))
}
