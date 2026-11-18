package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/jprkindrid/rewrapped-spotify/internal/auth"
	"github.com/jprkindrid/rewrapped-spotify/internal/cache"
	"github.com/jprkindrid/rewrapped-spotify/internal/config"
	"github.com/jprkindrid/rewrapped-spotify/internal/database"
	"github.com/jprkindrid/rewrapped-spotify/internal/email"
	"github.com/jprkindrid/rewrapped-spotify/internal/handlers"
	"github.com/jprkindrid/rewrapped-spotify/internal/middleware"
	"github.com/jprkindrid/rewrapped-spotify/internal/server"
	"github.com/jprkindrid/rewrapped-spotify/internal/testutil"
)

const testSecret = "flow-test-secret"

// fakeSender records emails instead of sending them.
type fakeSender struct {
	mu   sync.Mutex
	sent []email.Message
}

func (f *fakeSender) Send(_ context.Context, msg email.Message) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.sent = append(f.sent, msg)
	return nil
}

func (f *fakeSender) count() int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return len(f.sent)
}

// lastToken extracts the token from the most recent email's link.
func (f *fakeSender) lastToken(t *testing.T) string {
	t.Helper()
	f.mu.Lock()
	defer f.mu.Unlock()
	if len(f.sent) == 0 {
		t.Fatal("no email was sent")
	}
	text := f.sent[len(f.sent)-1].Text
	start := strings.Index(text, "http://app.test/auth/verify?token=")
	if start == -1 {
		t.Fatalf("no verify link in email: %q", text)
	}
	link := strings.Fields(text[start:])[0]
	u, err := url.Parse(link)
	if err != nil {
		t.Fatalf("bad link %q: %v", link, err)
	}
	return u.Query().Get("token")
}

type testApp struct {
	srv    *httptest.Server
	db     *database.Queries
	sender *fakeSender
}

func newTestApp(t *testing.T) *testApp {
	t.Helper()

	queries := database.New(testutil.MigratedDB(t))
	sender := &fakeSender{}
	env := &config.Config{
		Auth:   &config.AuthConfig{JWTSecret: testSecret},
		Server: &config.ServerConfig{},
		Demo:   &config.DemoConfig{},
		Email:  &config.EmailConfig{AppURL: "http://app.test"},
		Time: &config.TimeConfig{
			SessionExpiry:   30 * 24 * time.Hour,
			GuestRetention:  7 * 24 * time.Hour,
			LoginLinkExpiry: 15 * time.Minute,
			ResetLinkExpiry: 30 * time.Minute,
		},
	}

	cfg := &handlers.ApiConfig{
		DB:        queries,
		Env:       env,
		DataCache: cache.NewUserDataCache(time.Minute, 10),
		Email:     sender,
		Sessions:  middleware.NewSessionChecker(queries),
	}

	mux := http.NewServeMux()
	server.RegisterRoutes(mux, cfg)
	srv := httptest.NewServer(mux)
	t.Cleanup(srv.Close)

	return &testApp{srv: srv, db: queries, sender: sender}
}

// do sends a JSON request and decodes a JSON response into a map.
func (a *testApp) do(t *testing.T, method, path, token string, body any) (int, map[string]any) {
	t.Helper()

	var reader *bytes.Reader
	if body != nil {
		raw, err := json.Marshal(body)
		if err != nil {
			t.Fatal(err)
		}
		reader = bytes.NewReader(raw)
	} else {
		reader = bytes.NewReader(nil)
	}

	req, err := http.NewRequest(method, a.srv.URL+path, reader)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	out := map[string]any{}
	_ = json.NewDecoder(resp.Body).Decode(&out)
	return resp.StatusCode, out
}

func (a *testApp) mustToken(t *testing.T, wantStatus int, method, path, token string, body any) string {
	t.Helper()
	status, out := a.do(t, method, path, token, body)
	if status != wantStatus {
		t.Fatalf("%s %s: status %d, want %d (%v)", method, path, status, wantStatus, out)
	}
	tok, _ := out["token"].(string)
	if tok == "" {
		t.Fatalf("%s %s: no token in response %v", method, path, out)
	}
	return tok
}

func claimsOf(t *testing.T, token string) *auth.SessionClaims {
	t.Helper()
	claims, err := auth.ParseSessionToken(token, []byte(testSecret))
	if err != nil {
		t.Fatalf("parse token: %v", err)
	}
	return claims
}

func (a *testApp) register(t *testing.T, address, password string) string {
	t.Helper()
	return a.mustToken(t, http.StatusCreated, "POST", "/auth/register", "", map[string]string{"email": address, "password": password})
}

// sessionWorks reports whether token is accepted by an authenticated route.
func (a *testApp) sessionWorks(t *testing.T, token string) bool {
	t.Helper()
	status, _ := a.do(t, "POST", "/auth/refresh", token, nil)
	return status == http.StatusOK
}

func TestRegisterDuplicateEmailIsConflict(t *testing.T) {
	app := newTestApp(t)
	app.register(t, "dup@example.com", "password123")

	status, out := app.do(t, "POST", "/auth/register", "", map[string]string{"email": "DUP@example.com ", "password": "password123"})
	if status != http.StatusConflict {
		t.Fatalf("duplicate registration: status %d, want 409 (%v)", status, out)
	}
}

func TestSessionsUseUserIDNotEmail(t *testing.T) {
	app := newTestApp(t)
	token := app.register(t, "who@example.com", "password123")

	claims := claimsOf(t, token)
	if strings.Contains(claims.Subject, "@") {
		t.Fatalf("token subject should be the user id, got %q", claims.Subject)
	}

	// Changing email keeps the same identity and session.
	newToken := app.mustToken(t, http.StatusOK, "PUT", "/api/account/email", token,
		map[string]string{"new_email": "new@example.com", "password": "password123"})
	if claimsOf(t, newToken).Subject != claims.Subject {
		t.Fatal("changing email must not change the user id")
	}
	if !app.sessionWorks(t, token) {
		t.Fatal("existing session should survive an email change")
	}

	// The old address is free again and is a different person.
	other := app.register(t, "who@example.com", "password123")
	if claimsOf(t, other).Subject == claims.Subject {
		t.Fatal("re-registering the old email must create a new user")
	}
}

func TestLegacyEmailSubjectTokenRejected(t *testing.T) {
	app := newTestApp(t)
	app.register(t, "legacy@example.com", "password123")

	legacy, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "legacy@example.com",
		"iss": "api-rewrapped-spotify",
		"exp": time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte(testSecret))
	if err != nil {
		t.Fatal(err)
	}

	if app.sessionWorks(t, legacy) {
		t.Fatal("old email-subject tokens must not authenticate")
	}
}

func TestGuestClaimWithPassword(t *testing.T) {
	app := newTestApp(t)
	guest := app.mustToken(t, http.StatusCreated, "POST", "/auth/guest", "", nil)

	gc := claimsOf(t, guest)
	if !gc.Guest || gc.DisplayName != "Guest" {
		t.Fatalf("guest token claims = %+v", gc)
	}
	if left := time.Until(gc.ExpiresAt.Time); left < 6*24*time.Hour || left > 8*24*time.Hour {
		t.Fatalf("guest session should last about 7 days, got %v", left)
	}

	// Guests can't use account-only endpoints.
	if status, _ := app.do(t, "PUT", "/api/account/display-name", guest, map[string]string{"display_name": "x"}); status != http.StatusForbidden {
		t.Fatalf("guest display-name change: status %d, want 403", status)
	}

	account := app.mustToken(t, http.StatusOK, "POST", "/api/account/claim", guest,
		map[string]string{"email": "Saved@Example.com", "password": "password123", "display_name": "Saver"})

	ac := claimsOf(t, account)
	if ac.Guest || !ac.HasPassword || ac.DisplayName != "Saver" {
		t.Fatalf("claimed token claims = %+v", ac)
	}
	if ac.Subject != gc.Subject {
		t.Fatal("claiming must keep the same user (and so the same data)")
	}

	user, err := app.db.GetUserByID(context.Background(), ac.Subject)
	if err != nil {
		t.Fatal(err)
	}
	if user.IsGuest || user.GuestExpiresAt.Valid {
		t.Fatalf("claimed user should no longer expire: %+v", user)
	}

	app.mustToken(t, http.StatusOK, "POST", "/auth/login", "", map[string]string{"email": "saved@example.com", "password": "password123"})

	if status, _ := app.do(t, "POST", "/api/account/claim", account, map[string]string{"email": "x@example.com", "password": "password123"}); status != http.StatusBadRequest {
		t.Fatalf("claiming twice: status %d, want 400", status)
	}
}

func TestGuestClaimByEmailLink(t *testing.T) {
	app := newTestApp(t)
	guest := app.mustToken(t, http.StatusCreated, "POST", "/auth/guest", "", nil)

	status, out := app.do(t, "POST", "/api/account/claim", guest, map[string]string{"email": "linked@example.com"})
	if status != http.StatusAccepted {
		t.Fatalf("claim by link: status %d, want 202 (%v)", status, out)
	}

	link := app.sender.lastToken(t)
	status, out = app.do(t, "POST", "/auth/verify", "", map[string]string{"token": link})
	if status != http.StatusOK || out["purpose"] != auth.EmailPurposeClaim {
		t.Fatalf("verify claim: status %d (%v)", status, out)
	}

	claims := claimsOf(t, out["token"].(string))
	if claims.Guest || claims.HasPassword || claims.Subject != claimsOf(t, guest).Subject {
		t.Fatalf("claimed-by-link claims = %+v", claims)
	}

	if status, _ := app.do(t, "POST", "/auth/verify", "", map[string]string{"token": link}); status != http.StatusBadRequest {
		t.Fatalf("reusing a link: status %d, want 400", status)
	}
}

func TestGuestCannotClaimExistingEmail(t *testing.T) {
	app := newTestApp(t)
	app.register(t, "taken@example.com", "password123")
	guest := app.mustToken(t, http.StatusCreated, "POST", "/auth/guest", "", nil)

	for _, body := range []map[string]string{
		{"email": "taken@example.com", "password": "password123"},
		{"email": "taken@example.com"},
	} {
		if status, out := app.do(t, "POST", "/api/account/claim", guest, body); status != http.StatusConflict {
			t.Fatalf("claim existing email %v: status %d, want 409 (%v)", body, status, out)
		}
	}
	if app.sender.count() != 0 {
		t.Fatal("no email should go to an existing account's address from a claim")
	}
}

func TestEmailLinkLogin(t *testing.T) {
	app := newTestApp(t)
	registered := app.register(t, "linkme@example.com", "password123")

	status, out := app.do(t, "POST", "/auth/email-link", "", map[string]string{"email": "LinkMe@example.com", "purpose": "login"})
	if status != http.StatusAccepted {
		t.Fatalf("email link: status %d (%v)", status, out)
	}

	status, out = app.do(t, "POST", "/auth/verify", "", map[string]string{"token": app.sender.lastToken(t)})
	if status != http.StatusOK || out["purpose"] != auth.EmailPurposeLogin {
		t.Fatalf("verify login link: status %d (%v)", status, out)
	}
	session := out["token"].(string)
	if claimsOf(t, session).Subject != claimsOf(t, registered).Subject || !app.sessionWorks(t, session) {
		t.Fatal("login link should sign in as the account")
	}
}

func TestEmailLinkUnknownAddressLooksTheSame(t *testing.T) {
	app := newTestApp(t)
	app.register(t, "real@example.com", "password123")

	_, known := app.do(t, "POST", "/auth/email-link", "", map[string]string{"email": "real@example.com", "purpose": "login"})
	status, unknown := app.do(t, "POST", "/auth/email-link", "", map[string]string{"email": "nobody@example.com", "purpose": "login"})

	if status != http.StatusAccepted || known["message"] != unknown["message"] {
		t.Fatalf("unknown address must get the same answer: %d %v vs %v", status, unknown, known)
	}
	if app.sender.count() != 1 {
		t.Fatalf("only the real account should be emailed, sent %d", app.sender.count())
	}
}

func TestEmailLinkPerAddressLimit(t *testing.T) {
	app := newTestApp(t)
	app.register(t, "spam@example.com", "password123")

	for i := range 3 {
		if status, out := app.do(t, "POST", "/auth/email-link", "", map[string]string{"email": "spam@example.com", "purpose": "login"}); status != http.StatusAccepted {
			t.Fatalf("request %d: status %d (%v)", i+1, status, out)
		}
	}
	if status, _ := app.do(t, "POST", "/auth/email-link", "", map[string]string{"email": "spam@example.com", "purpose": "login"}); status != http.StatusTooManyRequests {
		t.Fatalf("4th link in the window: status %d, want 429", status)
	}
}

func TestPasswordResetRevokesOtherSessions(t *testing.T) {
	app := newTestApp(t)
	oldSession := app.register(t, "forgot@example.com", "oldpassword")
	if !app.sessionWorks(t, oldSession) {
		t.Fatal("fresh session should work")
	}

	app.do(t, "POST", "/auth/email-link", "", map[string]string{"email": "forgot@example.com", "purpose": "reset"})
	status, out := app.do(t, "POST", "/auth/verify", "", map[string]string{"token": app.sender.lastToken(t)})
	if status != http.StatusOK || out["purpose"] != auth.EmailPurposeReset {
		t.Fatalf("verify reset link: status %d (%v)", status, out)
	}
	resetSession := out["token"].(string)
	if !claimsOf(t, resetSession).PasswordReset {
		t.Fatal("reset link should open a password-reset session")
	}

	// No current password needed from a reset session.
	newSession := app.mustToken(t, http.StatusOK, "PUT", "/api/account/password", resetSession,
		map[string]string{"new_password": "newpassword"})

	if app.sessionWorks(t, oldSession) {
		t.Fatal("old sessions must be signed out after a reset")
	}
	if app.sessionWorks(t, resetSession) {
		t.Fatal("the reset session itself must be spent after use")
	}
	if !app.sessionWorks(t, newSession) {
		t.Fatal("the session returned by the reset should work")
	}

	if status, _ := app.do(t, "POST", "/auth/login", "", map[string]string{"email": "forgot@example.com", "password": "oldpassword"}); status != http.StatusUnauthorized {
		t.Fatalf("old password: status %d, want 401", status)
	}
	app.mustToken(t, http.StatusOK, "POST", "/auth/login", "", map[string]string{"email": "forgot@example.com", "password": "newpassword"})
}

func TestChangePasswordNeedsCurrentOutsideReset(t *testing.T) {
	app := newTestApp(t)
	session := app.register(t, "change@example.com", "oldpassword")

	if status, _ := app.do(t, "PUT", "/api/account/password", session, map[string]string{"new_password": "newpassword"}); status != http.StatusBadRequest {
		t.Fatalf("missing current password: status %d, want 400", status)
	}
	if status, _ := app.do(t, "PUT", "/api/account/password", session, map[string]string{"current_password": "wrong-one", "new_password": "newpassword"}); status != http.StatusUnauthorized {
		t.Fatalf("wrong current password: status %d, want 401", status)
	}
	app.mustToken(t, http.StatusOK, "PUT", "/api/account/password", session,
		map[string]string{"current_password": "oldpassword", "new_password": "newpassword"})
}

func TestPasswordlessAccountCanSetPassword(t *testing.T) {
	app := newTestApp(t)
	guest := app.mustToken(t, http.StatusCreated, "POST", "/auth/guest", "", nil)
	app.do(t, "POST", "/api/account/claim", guest, map[string]string{"email": "nopw@example.com"})
	_, out := app.do(t, "POST", "/auth/verify", "", map[string]string{"token": app.sender.lastToken(t)})
	session := out["token"].(string)

	// No password yet, so nothing to log in with...
	if status, _ := app.do(t, "POST", "/auth/login", "", map[string]string{"email": "nopw@example.com", "password": "anything1"}); status != http.StatusUnauthorized {
		t.Fatalf("login without a password set: status %d, want 401", status)
	}
	// ...and changing email first requires one.
	if status, _ := app.do(t, "PUT", "/api/account/email", session, map[string]string{"new_email": "x@example.com"}); status != http.StatusBadRequest {
		t.Fatalf("email change without password: status %d, want 400", status)
	}

	updated := app.mustToken(t, http.StatusOK, "PUT", "/api/account/password", session, map[string]string{"new_password": "firstpassword"})
	if !claimsOf(t, updated).HasPassword {
		t.Fatal("token should report the new password")
	}
	app.mustToken(t, http.StatusOK, "POST", "/auth/login", "", map[string]string{"email": "nopw@example.com", "password": "firstpassword"})
}

func TestDeletedGuestSessionRejected(t *testing.T) {
	app := newTestApp(t)
	guest := app.mustToken(t, http.StatusCreated, "POST", "/auth/guest", "", nil)
	if !app.sessionWorks(t, guest) {
		t.Fatal("guest session should work")
	}

	if status, out := app.do(t, "DELETE", "/api/delete", guest, nil); status != http.StatusOK {
		t.Fatalf("delete guest: status %d (%v)", status, out)
	}
	if app.sessionWorks(t, guest) {
		t.Fatal("a deleted user's session must stop working")
	}
}

func TestEmailFeaturesUnavailableWithoutSender(t *testing.T) {
	app := newTestApp(t)
	app.register(t, "noemail@example.com", "password123")

	// Swap in a server whose ApiConfig has no sender.
	queries := app.db
	cfg := &handlers.ApiConfig{
		DB: queries,
		Env: &config.Config{
			Auth:   &config.AuthConfig{JWTSecret: testSecret},
			Server: &config.ServerConfig{},
			Demo:   &config.DemoConfig{},
			Email:  &config.EmailConfig{AppURL: "http://app.test"},
			Time:   &config.TimeConfig{SessionExpiry: time.Hour, GuestRetention: time.Hour},
		},
		DataCache: cache.NewUserDataCache(time.Minute, 10),
		Sessions:  middleware.NewSessionChecker(queries),
	}
	mux := http.NewServeMux()
	server.RegisterRoutes(mux, cfg)
	srv := httptest.NewServer(mux)
	defer srv.Close()
	noEmail := &testApp{srv: srv, db: queries, sender: &fakeSender{}}

	if _, out := app.do(t, "GET", "/auth/config", "", nil); out["email_enabled"] != true {
		t.Fatalf("config with a sender should enable email: %v", out)
	}
	if _, out := noEmail.do(t, "GET", "/auth/config", "", nil); out["email_enabled"] != false {
		t.Fatalf("config without a sender should disable email: %v", out)
	}

	if status, _ := noEmail.do(t, "POST", "/auth/email-link", "", map[string]string{"email": "noemail@example.com", "purpose": "login"}); status != http.StatusServiceUnavailable {
		t.Fatalf("email link without sender: status %d, want 503", status)
	}

	guest := noEmail.mustToken(t, http.StatusCreated, "POST", "/auth/guest", "", nil)
	if status, _ := noEmail.do(t, "POST", "/api/account/claim", guest, map[string]string{"email": "g@example.com"}); status != http.StatusServiceUnavailable {
		t.Fatalf("claim by link without sender: status %d, want 503", status)
	}
	// Claiming with a password still works without email.
	noEmail.mustToken(t, http.StatusOK, "POST", "/api/account/claim", guest, map[string]string{"email": "g@example.com", "password": "password123"})
}
