# AGENTS GUIDE

This file collects everything a future coding agent needs to build, test, lint, and extend
ReWrapped Spotify. Follow it as you would a human's onboarding note; it exists so we can run
through the repo with confidence, spot guards for style, and never forget how to exercise a
single test or select the correct lint command.

## Philosophy
- Own each change end-to-end: verify the backend (Go + sqlc) and the frontend (React + Tailwind)
  build cleanly before declaring victory.
- Keep workflows deterministic:
  - Always run `gofmt`/`eslint` (or rely on the provided scripts) before shipping Go or TS work.
  - Prefer reproducible installs (`bun install`, `go mod download`).
- When in doubt, line up with the existing patterns: exported Go helpers live in `internal/..` with
  PascalCase names, private helpers stay camelCase, React hooks start with `use`, and Tailwind
  classes compound intentionally instead of piling random utility strings.

## Environment Setup
1. **Go tooling (>= 1.25)** – used for backend, SQL compilation, and `go test`. Install via
   https://golang.org/doc/install.
2. **SQLite + Goose** – migrations run against `server/data/userdata.sqlite`. Own the `goose`
   binary when you work with `make migrate-up`/`down`.
3. **Bun + Node 20+** – frontend uses Bun (`bun install`) but the `package.json` scripts work with
   npm/pnpm/yarn too; Bun just keeps installs fast.

## Build & Run Commands

### Backend (Go)
- `cd server && make build` – compiles `cmd/main.go` into `app` using the current Go toolchain.
- `cd server && make run` – builds then runs the binary (hooks in `.env` for ports and secrets).
- `cd server && make clean` – removes the binary.
- `docker-compose up --build` – brings up the backend + any linked services (used in local CI).

### Frontend (React + Vite)
- `cd web && bun install` – installs the dependencies defined in `package.json` (compatible with
  npm/yarn/pnpm as well).
- `cd web && npm run dev` – starts Vite in dev mode (`localhost:5173` proxying to the backend).
- `cd web && npm run build` – runs `tsc -b` then `vite build` for production artifacts.
- `cd web && npm run preview` – tests the production build locally.

## Tests & Validation
- `cd server && go test ./...` – full backend test suite (validation, summary analytics, helpers).
- `cd server && go test ./internal/summary -run TestSummaryIsolated -count=1` – example of narrowing a
  suite to a single test so you can iterate quickly. Replace `TestSummaryIsolated` with the test name.
- `cd server && go test ./internal/validation -run TestValidateTimeRange` – demonstrates how to run
  a targeted validation test without recompiling everything.
- Frontend currently has no automated Jest/Playwright tests. Use `npm run build` as a smoke test for
  the UI and rely on lint to guard TypeScript types.

## Linting & Formatting
- **Go:** Run `gofmt` and `go test ./...` (the tests will fail fast on formatting issues because the
  codebase is already formatted with Go's defaults). When adding new files, run `gofmt ./...` or an
  equivalent IDE action.
- **TypeScript/JS:** `cd web && npm run lint` (ESLint). The config enforces `@eslint/js` rules,
  `react-hooks`, and `react-refresh`. `prettier` + `prettier-plugin-tailwindcss` normalize formatting.
- **CSS/Tailwind:** Vite/Tailwind 4 manages stylesheets. Keep `src/index.css` lean and favor
  component-scoped class lists over global overrides.

## Pulling, Exporting, & Secrets
- `git pull --rebase` is a common workflow, but not required; follow repo policy as needed.
- `.env` files in `server/` are private; do not commit secrets.
- `.env.production` in `web/` is example-only but still treat it as sensitive material (do not push
  real tokens). Use Fly/Cloudflare config for deployment secrets.

## Code Style Guidelines
### Go
1. **Imports:** Group them as standard library first, blank line, then third-party, then local packages with
   full module paths (`github.com/jprkindrid/rewrapped-spotify/internal/...`).
2. **Formatting:** Always run `gofmt`. The project uses Go defaults (tabs for indents, line breaks at 80+
   characters where necessary). No custom formatting tool is permitted.
3. **Naming:**
   - Exported identifiers use PascalCase (e.g., `SummaryResponse`, `ApiConfig`).
   - Unexported helpers stay camelCase and descriptive (e.g., `max`, `pagedArtists`).
   - Constants that are configuration anchors stay uppercase (`JWTSecretKey`). Feature flags use
     `const demoModeEnabled = true` style in `internal/constants`.
4. **Handlers & Context:** HTTP handlers always accept `context.Context` via `r.Context()`. Grab the
   `userID` from `ctx.Value(constants.UserIDKey)` and bail early if it is missing (respond with
   `http.StatusUnauthorized`).
5. **Error handling:**
   - Prefer returning errors to bubbling them; wrap with `fmt.Errorf("failed to X: %w", err)` only when it
     adds action context.
   - Use `utils.RespondWithError(...)` in HTTP handlers to keep response shape consistent.
   - Do not ignore errors; handle `err != nil` immediately and return once you've responded.
6. **Pagination/Bounds:** When slicing lists (artists/tracks) guard with `len` checks before slicing – use
   helper functions (see `summary.go`) to avoid panics.
7. **Tests:** Prefer table-driven tests with subtests. Keep test helpers in `_test.go` files and mark them
   with `t.Helper()` if they wrap asserts.

### Frontend (React + TypeScript + Tailwind)
1. **Imports:** Keep import blocks ordered: third-party packages first, then absolute `@/` imports, then
   relative paths. Avoid deeply nested relative paths by using the `@/` alias defined in `tsconfig`.
2. **TypeScript config:** The repo runs with `strict`, `noUnusedLocals`, `noUnusedParameters`,
   `noFallthroughCasesInSwitch`, and `noUncheckedSideEffectImports`. Respect those flags; if `tsc`
   fails, treat the failure as the linting failure.
3. **Naming:** Components and hooks are PascalCase (`SummaryCard`), props interfaces use `XxxProps`.
   Variables inside components follow camelCase and describe their purpose.
4. **Styling:**
   - Tailwind 4 is the default styling mechanism; prefer composing descriptive class sets over inline style
     objects.
   - Introduce CSS variables sparingly (e.g., `--rw-primary`) and keep them defined in `src/index.css` or
     a `theme/constants.ts` file, not spread across components.
   - For animations, use purposeful transitions (e.g., staggered `fadeUp`, `expand`). Avoid excessive
     motion but do use micro-animations when the UX benefits (e.g., chart reveals or filter toggles).
5. **State & Data Fetching:**
   - Data loading lives in hooks under `src/hooks/` using TanStack Query. Keep `useQuery` keys stable and
     memoize derived data when necessary (use `useMemo`/`useCallback`).
   - Prefer derived state over duplicating the same values across components.
   - Handle loading/error states explicitly; show skeletons/spinners rather than leaving blank areas.
6. **Accessibility:** Use `aria` labels on interactive elements, pair icons with text when they have actions,
   and ensure focus outlines are visible.

## Import/Formatting Rules Summary
- Go: `gofmt`, grouped imports, `context` first argument, error handling via `if err != nil { return }`.
- React: `eslint`/`prettier`, `@/` alias, Tailwind 4 classes, descriptive hook/prop names.
- Shared: keep docs updated when adding new scripts.

## Cursor & Copilot Rules
- Checked `.cursor/rules/` and `.cursorrules`: none present.
- Checked `.github/copilot-instructions.md`: file missing, so no additional Copilot constraints.

## Useful References
- Backend: `server/Makefile`, `server/cmd/main.go`, `server/internal/...` (handlers, auth, parser).
- Frontend: `web/package.json`, `web/vite.config.ts`, `web/src/*` (components, hooks, utils).
- CI/workflows: `.github/workflows/deploy.yml` to see how Docker and Fly deploys work.

## Next Steps for Agents
1. When you arrive, run `bun install` and `go mod download` before touching code.
2. Use `npm run lint` (frontend) and `go test ./...` (backend) as basic sanity checks.
3. Document every new command or lint target you introduce so future agents find it here.
