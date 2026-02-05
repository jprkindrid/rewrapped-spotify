package storage

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

const BUCKET_PREFIX = "user-data"

func (c *CloudflareClient) UploadJSON(ctx context.Context, data any, userSpotifyID string) (string, error) {
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		return "", fmt.Errorf("[STORAGE] failed to marshall JSON: %w", err)
	}

	var compressed bytes.Buffer
	gzipWriter := gzip.NewWriter(&compressed)
	if _, err := gzipWriter.Write(jsonBytes); err != nil {
		return "", fmt.Errorf("[STORAGE] failed to compress JSON: %w", err)
	}
	if err := gzipWriter.Close(); err != nil {
		return "", fmt.Errorf("[STORAGE] failed to finalize gzip: %w", err)
	}
	compressedBytes := compressed.Bytes()

	key := generateKey(userSpotifyID, BUCKET_PREFIX)

	_, err = c.s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        &c.bucketname,
		Key:           &key,
		ContentType:   aws.String("application/json"),
		ContentLength: aws.Int64(int64(len(compressedBytes))),
		Metadata: map[string]string{
			"compression": "gzip",
		},
		Body: bytes.NewReader(compressedBytes),
	})

	if err != nil {
		return "", fmt.Errorf("[STORAGE] failed to upload to R2 %w", err)
	}

	return key, nil
}

func generateKey(userID, prefix string) string {
	now := time.Now().UTC()
	id := uuid.New().String()

	return fmt.Sprintf("%s/%s/%04d/%02d/%02d/%s.json",
		prefix, userID, now.Year(), now.Month(), now.Day(), id)
}
