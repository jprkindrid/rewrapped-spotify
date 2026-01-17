package handlers

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/jprkindrid/rewrapped-spotify/internal/constants"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
	"github.com/jprkindrid/rewrapped-spotify/internal/services"
	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

func (cfg *ApiConfig) HandlerUpload(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(constants.MaxFileUploadSize)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "File parsing error", err)
		return
	}

	files := r.MultipartForm.File[constants.FileFormHeader]
	var userSongData []parser.MinifiedSongData

	for _, fileheader := range files {
		data, err := processUploadedFile(fileheader)
		if err != nil {
			fmt.Printf("Failed to process %s: %v", fileheader.Filename, err)
			continue
		}

		if data != nil {
			userSongData = append(userSongData, data...)
		}
	}
	_, err = services.StoreData(r, userSongData, cfg.DB, cfg.Env)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "unable to store user data in database", err)
		return
	}

	cfg.DataCache.Set(r.Context().Value(constants.UserIDKey).(string), userSongData) // if we got this far that context value wont fail

	utils.RespondWithJSON(w, http.StatusAccepted, map[string]string{})
}

func processUploadedFile(fh *multipart.FileHeader) ([]parser.MinifiedSongData, error) {
	ext := strings.ToLower(filepath.Ext(fh.Filename))

	file, err := fh.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open: %w", err)
	}
	defer file.Close()

	var paths []string

	switch ext {
	case ".json":
		paths, err = parser.SaveTempFile(file, fh.Filename, constants.TempDirName)
	case ".zip":
		paths, err = parser.UnzipAndExtractFiles(file, constants.TempDirName)
	default:
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	defer cleanupPaths(paths)

	if len(paths) == 0 {
		return nil, nil
	}

	parsedData, err := parser.ParseJsonFiles(paths)
	if err != nil {
		return nil, fmt.Errorf("parse error: %w", err)
	}

	return parser.MinifyParsedData(parsedData), nil
}

func cleanupPaths(paths []string) {
	for _, p := range paths {
		os.Remove(p)
	}
}
