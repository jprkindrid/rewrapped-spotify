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
		if f.FileInfo().IsDir() {
			continue
		}

		ext := filepath.Ext(f.Name)
		if !(ext == ".json") {
			continue
		}

		rc, err := f.Open()
		if err != nil {
			return nil, err
		}

		outPath := filepath.Join(dest, f.Name)

		if err := os.MkdirAll(filepath.Dir(outPath), os.ModePerm); err != nil {
			rc.Close()
			return nil, err
		}

		outFile, err := os.Create(outPath)
		if err != nil {
			rc.Close()
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
