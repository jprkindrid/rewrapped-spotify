package handlers

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/spotify"
	"github.com/jprkindrid/rewrapped-spotify/internal/summary"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

type imageRequest struct {
	EntryType    string                `json:"entry_type"`
	PagedEntries []summary.ScoredEntry `json:"entries"`
}

func (cfg *ApiConfig) HandlerSummaryImages(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(constants.UserIDKey).(string)
	if !ok || userID == "" {
		slog.Error("[Images] no user ID in session")
		utils.RespondWithError(w, http.StatusUnauthorized, "No user ID in session", fmt.Errorf("no user id in session"))
		return
	}

	var data imageRequest
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		slog.Error("[Images] bad json data")
		utils.RespondWithError(w, http.StatusBadRequest, "invalid json body", err)
		return
	}

	spotifyClient := spotify.GetClient(cfg.Env)

	var metaInfo []spotify.MetaInfo
	var err error
	switch data.EntryType {
	case "tracks":
		metaInfo, err = spotifyClient.GetSummaryTrackMetaData(data.PagedEntries)
	case "artists":
		metaInfo, err = spotifyClient.GetSummaryArtistMetaData(data.PagedEntries)
	}

	if err != nil {
		slog.Error("[Images] couldnt get metadata", "err", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to fetch entry metadata", err)
		return
	}

	slog.Info("[Images] successfully got images")

	utils.RespondWithJSON(w, http.StatusOK, metaInfo)

}
