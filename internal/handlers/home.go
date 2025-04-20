package handlers

import (
	"net/http"
	"path/filepath"

	"github.com/markbates/goth/gothic"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	sess, _ := gothic.Store.Get(r, gothic.SessionName)

	if userID, ok := sess.Values["user_id"]; ok && userID != nil {
		http.Redirect(w, r, "/upload", http.StatusFound)
		return
	}

	http.ServeFile(w, r, filepath.Join("web", "public", "index.html"))
}

func UploadPageHandler(w http.ResponseWriter, r *http.Request) {
	// 1) Load the session
	sess, err := gothic.Store.Get(r, gothic.SessionName)
	if err != nil {
		http.Redirect(w, r, "/auth/spotify", http.StatusFound)
		return
	}

	// 2) Check authentication
	if _, ok := sess.Values["user_id"]; !ok {
		http.Redirect(w, r, "/auth/spotify", http.StatusFound)
		return
	}

	// 3) Serve the upload page
	http.ServeFile(w, r, "./web/public/upload/index.html")
}
