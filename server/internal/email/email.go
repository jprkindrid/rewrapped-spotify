// Package email sends transactional email (sign-in and reset links).
package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/jprkindrid/rewrapped-spotify/internal/config"
)

type Message struct {
	To      string
	Subject string
	Text    string
	HTML    string
}

type Sender interface {
	Send(ctx context.Context, msg Message) error
}

// NewSender returns a Resend sender when RESEND_API_KEY and EMAIL_FROM are
// set. Without them it logs messages in development and returns nil in
// production, where handlers then report that email is unavailable.
func NewSender(cfg *config.Config) Sender {
	if cfg.Email.ResendAPIKey != "" && cfg.Email.From != "" {
		return &ResendSender{
			apiKey: cfg.Email.ResendAPIKey,
			from:   cfg.Email.From,
			client: &http.Client{Timeout: 10 * time.Second},
		}
	}
	if cfg.Server.ProductionBuild {
		slog.Warn("[EMAIL] RESEND_API_KEY or EMAIL_FROM not set; email sign-in and password reset are disabled")
		return nil
	}
	slog.Info("[EMAIL] RESEND_API_KEY or EMAIL_FROM not set; emails will be logged instead of sent")
	return LogSender{}
}

const resendURL = "https://api.resend.com/emails"

type ResendSender struct {
	apiKey string
	from   string
	client *http.Client
}

func (s *ResendSender) Send(ctx context.Context, msg Message) error {
	body, err := json.Marshal(map[string]any{
		"from":    s.from,
		"to":      []string{msg.To},
		"subject": msg.Subject,
		"text":    msg.Text,
		"html":    msg.HTML,
	})
	if err != nil {
		return fmt.Errorf("failed to encode email: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, resendURL, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to build email request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		detail, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return fmt.Errorf("resend returned %d: %s", resp.StatusCode, detail)
	}
	return nil
}

// LogSender prints messages instead of sending them, for local development.
type LogSender struct{}

func (LogSender) Send(_ context.Context, msg Message) error {
	slog.Info("[EMAIL] not sent (development)", "to", msg.To, "subject", msg.Subject, "body", msg.Text)
	return nil
}

// LinkMessage builds a plain email whose only purpose is one button/link.
func LinkMessage(to, subject, intro, buttonLabel, link, expiry string) Message {
	text := fmt.Sprintf("%s\n\n%s: %s\n\nThis link expires in %s and works once. If you didn't ask for it, you can ignore this email.\n\n- ReWrapped", intro, buttonLabel, link, expiry)

	htmlBody := fmt.Sprintf(`<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
<h1 style="color:#1db954;font-size:22px;margin:0 0 16px">ReWrapped</h1>
<p style="font-size:15px;line-height:1.5">%s</p>
<p style="margin:24px 0"><a href="%s" style="background:#1db954;color:#000;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">%s</a></p>
<p style="font-size:13px;color:#555;line-height:1.5">This link expires in %s and works once. If you didn't ask for it, you can ignore this email.</p>
<p style="font-size:12px;color:#888;word-break:break-all">%s</p>
</div>`,
		html.EscapeString(intro),
		html.EscapeString(link),
		html.EscapeString(buttonLabel),
		html.EscapeString(expiry),
		html.EscapeString(link),
	)

	return Message{To: to, Subject: subject, Text: text, HTML: htmlBody}
}
