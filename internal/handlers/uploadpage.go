package handlers

import (
	"log"
	"net/http"
	"path/filepath"

	"github.com/markbates/goth/gothic"
)

func (cfg *ApiConfig) HandlerUploadPage(w http.ResponseWriter, r *http.Request) {
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
	}

	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")

	log.Printf("------ LOAD UPLOAD PAGE ---- ")
	http.ServeFile(w, r, filepath.Join("web", "static", "upload", "upload.html"))
}
