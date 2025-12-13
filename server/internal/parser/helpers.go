package parser

import (
	"io"
	"os"
	"path/filepath"
)

func SaveTempFile(r io.Reader, filename, dir string) ([]string, error) {
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return nil, err
	}

	outPath := filepath.Join(dir, filename)
	outFile, err := os.Create(outPath)
	if err != nil {
		return nil, err
	}
	defer outFile.Close()

	if _, err := io.Copy(outFile, r); err != nil {
		return nil, err
	}

	return []string{outPath}, nil
}
