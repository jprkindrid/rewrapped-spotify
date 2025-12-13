package parser

import (
	"archive/zip"
	"io"
	"log/slog"
	"mime/multipart"
	"os"
	"path/filepath"
)

func UnzipAndExtractFiles(file multipart.File, dest string) ([]string, error) {
	if err := os.MkdirAll(dest, os.ModePerm); err != nil {
		slog.Error("Failed to create destination directory", "destination", dest, "error", err)
		return nil, err
	}

	tempZipfile, err := os.CreateTemp("", "spotify-upload-*.zip")
	if err != nil {
		slog.Error("Failed to create temporary zip file", "error", err)
		return nil, err
	}
	defer os.Remove(tempZipfile.Name())

	_, err = io.Copy(tempZipfile, file)
	if err != nil {
		slog.Error("Failed to copy file to temporary zip", "error", err)
		return nil, err
	}

	r, err := zip.OpenReader(tempZipfile.Name())
	if err != nil {
		slog.Error("Failed to open zip reader", "error", err)
		return nil, err
	}
	defer r.Close()

	var extracted []string

	for _, f := range r.File {
		if f.FileInfo().IsDir() {
			continue
		}

		ext := filepath.Ext(f.Name)
		if !(ext == ".json") {
			slog.Debug("Skipping non-JSON file", "file", f.Name, "extension", ext)
			continue
		}

		rc, err := f.Open()
		if err != nil {
			slog.Error("Failed to open file in zip", "file", f.Name, "error", err)
			return nil, err
		}

		outPath := filepath.Join(dest, f.Name)

		if err := os.MkdirAll(filepath.Dir(outPath), os.ModePerm); err != nil {
			rc.Close()
			slog.Error("Failed to create output directory", "path", outPath, "error", err)
			return nil, err
		}

		outFile, err := os.Create(outPath)
		if err != nil {
			rc.Close()
			slog.Error("Failed to create output file", "path", outPath, "error", err)
			return nil, err
		}

		_, err = io.Copy(outFile, rc)
		rc.Close()
		outFile.Close()

		if err != nil {
			slog.Error("Failed to copy file content", "path", outPath, "error", err)
			return nil, err
		}

		extracted = append(extracted, outPath)
	}

	return extracted, nil
}
