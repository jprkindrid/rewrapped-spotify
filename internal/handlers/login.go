package handlers

import (
	"fmt"
	"net/http"

	"github.com/kindiregg/spotify-data-analyzer/internal/utils"
	"github.com/markbates/goth/gothic"
)

func CallbackHandler(w http.ResponseWriter, r *http.Request) {
	user, err := gothic.CompleteUserAuth(w, r)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error authenticating user", err)
		fmt.Fprintln(w, err)
		return
	}

	session, _ := gothic.Store.Get(r, "auth-session")
	session.Values["user_id"] = user.UserID
	session.Values["access_token"] = user.AccessToken
	err = session.Save(r, w)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "error saving session", err)
		return
	}

	fmt.Println(user)

	http.Redirect(w, r, "http://localhost:8080", http.StatusFound)
}
