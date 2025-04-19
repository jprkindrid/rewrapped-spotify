package handlers

import (
	"net/http"

	"github.com/markbates/goth/gothic"
)

func HelloHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello from your spotify not-wrapped"))
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	gothic.BeginAuthHandler(w, r)
}
