package storage

import (
	"bufio"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

func (c *CloudflareClient) GetJSON(ctx context.Context, key string) ([]parser.MinifiedSongData, error) {
	resp, err := c.s3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: &c.bucketname,
		Key:    &key,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get object for key %q: %w", key, err)
	}
	defer resp.Body.Close()

	reader, cleanup, err := newDecodedReader(resp)
	if err != nil {
		return nil, err
	}
	if cleanup != nil {
		defer cleanup()
	}

	var data []parser.MinifiedSongData
	if err := json.NewDecoder(reader).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode JSON for key %q: %w", key, err)
	}

	return data, nil
}

func newDecodedReader(resp *s3.GetObjectOutput) (io.Reader, func() error, error) {
	if resp.Body == nil {
		return nil, nil, fmt.Errorf("empty response body")
	}

	if isGzipEncoded(resp) {
		gzipReader, err := gzip.NewReader(resp.Body)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create gzip reader: %w", err)
		}
		return gzipReader, gzipReader.Close, nil
	}

	buffered := bufio.NewReader(resp.Body)
	if hasGzipMagic(buffered) {
		gzipReader, err := gzip.NewReader(buffered)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create gzip reader: %w", err)
		}
		return gzipReader, gzipReader.Close, nil
	}

	return buffered, nil, nil
}

func isGzipEncoded(resp *s3.GetObjectOutput) bool {
	if resp.ContentEncoding != nil && strings.Contains(strings.ToLower(*resp.ContentEncoding), "gzip") {
		return true
	}
	if resp.Metadata == nil {
		return false
	}
	if value, ok := resp.Metadata["compression"]; ok && strings.EqualFold(value, "gzip") {
		return true
	}
	if value, ok := resp.Metadata["Compression"]; ok && strings.EqualFold(value, "gzip") {
		return true
	}
	return false
}

func hasGzipMagic(reader *bufio.Reader) bool {
	const (
		gzipMagicFirst  = 0x1f
		gzipMagicSecond = 0x8b
	)

	bytes, err := reader.Peek(2)
	if err != nil {
		return false
	}
	return len(bytes) == 2 && bytes[0] == gzipMagicFirst && bytes[1] == gzipMagicSecond
}
