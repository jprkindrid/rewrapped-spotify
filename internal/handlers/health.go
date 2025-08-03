package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp time.Time         `json:"timestamp"`
	Version   string            `json:"version,omitempty"`
	Services  map[string]string `json:"services"`
}

// HandlerHealth is the method-based health handler
func (cfg *ApiConfig) HandlerHealth(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Services:  make(map[string]string),
		Version:   "1.0.0",
	}

	// Check database connectivity
	if err := cfg.checkDatabaseHealth(r.Context()); err != nil {
		response.Status = "unhealthy"
		response.Services["database"] = "error: " + err.Error()
		w.WriteHeader(http.StatusServiceUnavailable)
	} else {
		response.Services["database"] = "healthy"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (cfg *ApiConfig) checkDatabaseHealth(ctx context.Context) error {
	if cfg.DB == nil {
		return nil
	}
	_, err := cfg.DB.GetUserData(ctx, "health-check-non-existent-user")
	if err != nil && err.Error() != "sql: no rows in result set" {
		return err
	}
	return nil
}
