package constants

// API Limits and Defaults
const (
	DefaultLimit = 10
	MaxLimit     = 1000
	MinLimit     = 1
)

const (
	MaxFileUploadSize = 32 << 20
	MaxFilesPerUpload = 10
	TempDirName       = "tmp"
)

const (
	SessionMaxAge          = 86400 * 7
	MinSessionSecretLength = 32
)

const (
	SortByTime  = "time"
	SortByCount = "count"
)

const (
	DefaultSortBy = SortByCount
)

const FileFormHeader = "files"

type contextKey string

const UserIDKey contextKey = "user_id"
