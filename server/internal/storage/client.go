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

func GetClient() *CloudflareClient {
	if cloudflareClient == nil {
		Init()
	}

	return cloudflareClient
}

func Init() {
	ctx := context.Background()
	cfg := config.Get()

	bucketName := cfg.CloudflareBucketName
	if bucketName == "" {
		log.Fatal("CLOUDFLARE_BUCKET_NAME configuration not present")
	}
	accountId := cfg.CloudflareAccountID
	if accountId == "" {
		log.Fatal("CLOUDFLARE_ACCOUNT_ID configuration not present")
	}
	accessKeyId := cfg.CloudflareKeyID
	if accessKeyId == "" {
		log.Fatal("CLOUDFLARE_KEY_ID configuration not present")
	}
	accessKeySecret := cfg.CloudflareKeySecret
	if accessKeySecret == "" {
		log.Fatal("CLOUDFLARE_KEY_SECRET configuration not present")
	}

	cloudConfig, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyId, accessKeySecret, "")),
		awsconfig.WithRegion("auto"),
	)

	if err != nil {
		log.Fatalf("Couldnt configure Cloudflare s3: %v", err)
	}

	s3Client := s3.NewFromConfig(cloudConfig, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountId))
	})

	testKey := "connection_test.txt"
	_, err = s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: &bucketName,
		Key:    aws.String(testKey),
		Body:   strings.NewReader("ok"),
	})
	if err != nil {
		log.Fatalf("[STORAGE] could not write to Cloudflare bucket: %v", err)
	}

	_, _ = s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: &bucketName,
		Key:    aws.String(testKey),
	})

	cloudflareClient = &CloudflareClient{
		accountID:       accountId,
		accessKeyId:     accessKeyId,
		accessKeySecret: accessKeySecret,
		bucketname:      bucketName,
		s3Client:        s3Client,
	}

	slog.Info("[STORAGE] initialized Cloudflare client")
}
