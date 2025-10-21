package storage

import (
	"bytes"
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

	key := generateKey(userSpotifyID, BUCKET_PREFIX)

	_, err = c.s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      &c.bucketname,
		Key:         &key,
		ContentType: aws.String("application/json"),
		Body:        bytes.NewReader(jsonBytes),
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
