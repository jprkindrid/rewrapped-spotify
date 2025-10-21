package storage

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/jprkindrid/rewrapped-spotify/internal/parser"
)

func (c *CloudflareClient) GetJSON(ctx context.Context, key string, data *[]parser.MinifiedSongData) error {
	resp, err := c.s3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: &c.bucketname,
		Key:    &key,
	})

	if err != nil {
		return fmt.Errorf("failed to get object for key %q: %w", key, err)
	}

	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return fmt.Errorf("failed to decode JSON for key %q: %w", key, err)
	}

	return nil
}
