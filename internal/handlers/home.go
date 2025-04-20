package handlers

import (
	"log"
	"net/http"
	"path/filepath"

	"github.com/markbates/goth/gothic"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	s, err := gothic.Store.Get(r, gothic.SessionName)
	if err != nil {
		log.Printf("homehandler session error: %v", err)
		http.Redirect(w, r, "/auth/spotify", http.StatusFound)
		return
	}

	if _, ok := s.Values["user_id"]; ok {
		http.Redirect(w, r, "/auth/spotify", http.StatusFound)
		return
	}

	http.ServeFile(w, r, filepath.Join("web", "public", "index.html"))
}

func UploadPageHandler(w http.ResponseWriter, r *http.Request) {
	sess, _ := gothic.Store.Get(r, gothic.SessionName)
	if _, ok := sess.Values["user_id"]; !ok {
		http.Redirect(w, r, "/auth/spotify", http.StatusFound)
		return
	}
	http.ServeFile(w, r, "./web/public/upload/index.html")
}
