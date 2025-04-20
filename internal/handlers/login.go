package handlers

import (
	"fmt"
	"net/http"

	"github.com/kindiregg/spotify-data-analyzer/internal/utils"
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
		utils.RespondWithError(w, http.StatusInternalServerError, "error authenticating user", err)
		fmt.Fprintln(w, err)
		return
	}

	session, _ := gothic.Store.Get(r, gothic.SessionName)
	session.Values["user_id"] = user.UserID
	session.Values["access_token"] = user.AccessToken
	err = session.Save(r, w)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error saving session", err)
		return
	}

	fmt.Println(user)

	http.Redirect(w, r, "http://127.0.0.1:8080/upload", http.StatusFound)
}
