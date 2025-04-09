package parser

import (
	"archive/zip"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
)

func UnzipAndExtractFiles(file multipart.File, dest string) ([]string, error) {
	if err := os.MkdirAll(dest, os.ModePerm); err != nil {
		return nil, err
	}

	tempZipfile, err := os.CreateTemp("", "spotify-upload-*.zip")
	if err != nil {
		return nil, err
	}
	defer os.Remove(tempZipfile.Name())

	_, err = io.Copy(tempZipfile, file)
	if err != nil {
		return nil, err
	}

	r, err := zip.OpenReader(tempZipfile.Name())
	if err != nil {
		return nil, err
	}

	var extracted []string

	for _, f := range r.File {
		rc, err := f.Open()
		if err != nil {
			return nil, err
		}

		defer rc.Close()

		outPath := filepath.Join(dest, f.Name)
		outFile, err := os.Create(outPath)
		if err != nil {
			r.Close()
			return nil, err
		}

		_, err = io.Copy(outFile, rc)
		rc.Close()
		outFile.Close()

		if err != nil {
			return nil, err
		}

		extracted = append(extracted, outPath)

	}

	return extracted, nil
}
