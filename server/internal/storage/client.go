package storage

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/jprkindrid/rewrapped-spotify/internal/config"
)

type CloudflareClient struct {
	accountID       string
	accessKeyId     string
	accessKeySecret string
	bucketname      string
	s3Client        *s3.Client
}

var (
	cloudflareClient *CloudflareClient
)

func GetClient(cfg *config.Config) *CloudflareClient {
	if cloudflareClient == nil {
		Init(cfg)
	}

	return cloudflareClient
}

func Init(cfg *config.Config) {
	ctx := context.Background()
	CF := cfg.Storage

	cloudConfig, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(CF.KeyID, CF.KeySecret, "")),
		awsconfig.WithRegion("auto"),
	)

	if err != nil {
		log.Fatalf("Couldnt configure Cloudflare s3: %v", err)
	}

	s3Client := s3.NewFromConfig(cloudConfig, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", CF.AccountID))
	})

	testKey := "connection_test.txt"
	_, err = s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: &CF.BucketName,
		Key:    aws.String(testKey),
		Body:   strings.NewReader("ok"),
	})
	if err != nil {
		log.Fatalf("[STORAGE] could not write to Cloudflare bucket: %v", err)
	}

	_, _ = s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: &CF.BucketName,
		Key:    aws.String(testKey),
	})

	cloudflareClient = &CloudflareClient{
		accountID:       CF.AccountID,
		accessKeyId:     CF.KeyID,
		accessKeySecret: CF.KeySecret,
		bucketname:      CF.BucketName,
		s3Client:        s3Client,
	}

	slog.Info("[STORAGE] initialized Cloudflare client")
}
