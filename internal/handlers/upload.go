package handlers

import (
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/kindiregg/spotify-data-analyzer/internal/parser"
	"github.com/kindiregg/spotify-data-analyzer/internal/utils"
)

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	const uploadLimit = 32 << 20 // 32MB
	r.ParseMultipartForm(uploadLimit)

	file, header, err := r.FormFile("file")
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Failed to read form file", err)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))

	switch ext {
	case ".json":
		outPath := filepath.Join("tmp", header.Filename)

		if err := os.MkdirAll("tmp", os.ModePerm); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to create tmp dir", err)
			return
		}

		outFile, err := os.Create(outPath)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to save JSON file", err)
			return
		}
		defer outFile.Close()

		if _, err := io.Copy(outFile, file); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to write JSON file", err)
			return
		}

		log.Println("Extracted:", outPath)

		utils.RespondWithJSON(w, http.StatusAccepted, map[string]string{
			"message": "JSON file uploaded successfully",
			"path":    outPath,
		})

	case ".zip":
		paths, err := parser.UnzipAndExtractFiles(file, "tmp")
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to extract zip", err)
			return
		}

		for _, path := range paths {
			log.Println("Extracted:", path)
		}

		utils.RespondWithJSON(w, http.StatusAccepted, map[string]interface{}{
			"message": "ZIP extracted successfully",
			"files":   paths,
		})

	default:
		utils.RespondWithError(w, http.StatusBadRequest, "Only .json and .zip files are supported", nil)
	}
}
