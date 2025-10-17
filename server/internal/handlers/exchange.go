package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/auth"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

func (cfg *ApiConfig) HandlerExchange(w http.ResponseWriter, r *http.Request) {
	log.Printf("[EXCHANGE] AuthStore pointer: %p", cfg.AuthCodes)
	var body struct {
		AuthCode string `json:"auth_code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "bad auth code request", err)
		return
	}

	userID, name, ok := cfg.AuthCodes.ValidateAndDeleteCode(body.AuthCode)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "expired or invalid code", fmt.Errorf("expired or invalid auth code"))
		return

	}

	token, err := auth.GenerateJWT(userID, name)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "[Callback] error making jwt", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"token": token})

}
