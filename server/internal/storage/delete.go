package storage

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func (c *CloudflareClient) DeleteExistingBlob(ctx context.Context, key string) error {
	_, err := c.s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: &c.bucketname,
		Key:    &key,
	})

	if err != nil {
		slog.Warn("[STORAGE] error deleting existing cloudflare object with key %s: %v", key, err)
		return fmt.Errorf("could not delete existing cloudflare object")
	}
	return nil
}
