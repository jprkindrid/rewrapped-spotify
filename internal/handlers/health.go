package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/utils"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp time.Time         `json:"timestamp"`
	Version   string            `json:"version,omitempty"`
	Services  map[string]string `json:"services"`
}

// HealthHandler provides application health status
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Services:  make(map[string]string),
		Version:   "1.0.0", // TODO: Get from build info
	}

	// Check database connectivity
	if err := checkDatabaseHealth(r.Context()); err != nil {
		response.Status = "unhealthy"
		response.Services["database"] = "error: " + err.Error()
		w.WriteHeader(http.StatusServiceUnavailable)
	} else {
		response.Services["database"] = "healthy"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// checkDatabaseHealth verifies database connectivity
func checkDatabaseHealth(ctx context.Context) error {
	// Try a simple query to verify database is accessible
	if utils.Cfg == nil || utils.Cfg.DB == nil {
		return nil // Database not initialized, but we'll consider it healthy for startup
	}

	// Try to query a simple test - we expect this to fail with "no rows"
	// which means DB connection is working. A real connection error would be different.
	_, err := utils.Cfg.DB.GetUserData(ctx, "health-check-non-existent-user")
	// If we get a "no rows" error, that's actually good - it means DB is responding
	// If we get a connection error, that's bad
	if err != nil && err.Error() != "sql: no rows in result set" {
		return err
	}
	return nil
}
