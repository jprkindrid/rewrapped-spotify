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
		fmt.Printf("UPLOAD AUTHENTICATION ERROR: %v", err)
		return
	}

	sess, err := gothic.Store.Get(r, gothic.SessionName)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error loading session", err)
		return
	}
	sess.Values["user_id"] = user.UserID
	sess.Values["access_token"] = user.AccessToken

	if err := sess.Save(r, w); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error saving session", err)
		return
	}
	http.Redirect(w, r, "/upload", http.StatusFound)
}
