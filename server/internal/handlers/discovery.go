package handlers

import (
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/discovery"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
	"github.com/jprkindrid/rewrapped-spotify/internal/validation"
)

type DiscoveryResponse struct {
	Artists []discovery.DiscoveryEntry `json:"artists"`
}

func (cfg *ApiConfig) HandlerDiscovery(w http.ResponseWriter, r *http.Request) {
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

	sortParams := validation.ValidateSortParam(r)

	discoveryData := discovery.GenerateDiscoveryData(data, timeParams.Start, timeParams.End, sortParams.SortBy, discovery.DefaultLimit)

	utils.RespondWithJSON(w, http.StatusOK, DiscoveryResponse{
		Artists: discoveryData,
	})
}
