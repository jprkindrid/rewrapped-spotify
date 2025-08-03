package constants

// API Limits and Defaults
const (
	// DefaultLimit is the default number of items returned when no limit is specified
	DefaultLimit = 10

	// MaxLimit is the maximum number of items that can be requested at once
	MaxLimit = 1000

	// MinLimit is the minimum valid limit value
	MinLimit = 1
)

// File Upload Constants
const (
	// MaxFileUploadSize is the maximum size for file uploads (32MB)
	MaxFileUploadSize = 32 << 20

	// MaxFilesPerUpload is the maximum number of files that can be uploaded at once
	MaxFilesPerUpload = 10

	// TempDirName is the directory name for temporary file storage
	TempDirName = "tmp"
)

// Session and Security Constants
const (
	// SessionMaxAge is the maximum age for user sessions (7 days)
	SessionMaxAge = 86400 * 7

	// MinSessionSecretLength is the minimum required length for session secrets
	MinSessionSecretLength = 32
)

// HTTP Timeouts
const (
	// HTTPWriteTimeout is the maximum duration for writing HTTP responses
	HTTPWriteTimeout = 30

	// HTTPReadTimeout is the maximum duration for reading HTTP requests
	HTTPReadTimeout = 30
)

// Sort Options
const (
	SortByTime  = "time"
	SortByCount = "count"
)

// Default values
const (
	DefaultSortBy = SortByCount
)
