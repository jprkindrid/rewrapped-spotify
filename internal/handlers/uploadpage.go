package handlers

import (
	"log"
	"net/http"
	"path/filepath"

	"github.com/markbates/goth/gothic"
)

func UploadPageHandler(w http.ResponseWriter, r *http.Request) {
	sess, err := gothic.Store.Get(r, gothic.SessionName)
	if err != nil {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	userID, ok := sess.Values["user_id"].(string)
	if !ok || userID == "" {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

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
