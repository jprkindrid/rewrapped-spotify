package handlers

import (
	"net/http"
	"path/filepath"

	"github.com/markbates/goth/gothic"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	sess, _ := gothic.Store.Get(r, gothic.SessionName)

	userID, ok := sess.Values["user_id"].(string)
	if ok && userID != "" {
		http.Redirect(w, r, "/upload", http.StatusFound)
		return
	}

	http.ServeFile(w, r, filepath.Join("web", "static", "index.html"))
}
