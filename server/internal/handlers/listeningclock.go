package handlers

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/listeningclock"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/jprkindrid/rewrapped-spotify/internal/validation"
)

type ListeningClockResponse struct {
	Clock []listeningclock.ClockEntry `json:"clock"`
}

func (cfg *ApiConfig) HandlerListeningClock(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(constants.UserIDKey).(string)
	if !ok || userID == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", nil)
		return
	}

	data, status, err := cfg.loadUserData(ctx, userID)
	if err != nil {
		utils.RespondWithError(w, status, err.Error(), err)
		return
	}

	timeParams, err := validation.ValidateTimeRange(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	clockData := listeningclock.GenerateListeningClockData(data, timeParams.Start, timeParams.End)

	utils.RespondWithJSON(w, http.StatusOK, ListeningClockResponse{
		Clock: clockData,
	})
}
