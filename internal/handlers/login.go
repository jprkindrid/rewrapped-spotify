package handlers

import (
	"net/http"

	"github.com/markbates/goth/gothic"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()
	gothic.BeginAuthHandler(w, r)
}

func CallbackHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	q.Set("provider", "spotify")
	r.URL.RawQuery = q.Encode()

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		http.Redirect(w, r, "/?error=login_failed", http.StatusTemporaryRedirect)
		return
	}

	sess, err := gothic.Store.New(r, gothic.SessionName)
	if err != nil {
		http.Redirect(w, r, "/?error=session_error", http.StatusTemporaryRedirect)
		return
	}

	sess.Values["user_id"] = user.UserID
	sess.Values["access_token"] = user.AccessToken

	if err := sess.Save(r, w); err != nil {
		http.Redirect(w, r, "/?error=session_error", http.StatusTemporaryRedirect)
		return
	}

	http.Redirect(w, r, "/upload", http.StatusTemporaryRedirect)
}
