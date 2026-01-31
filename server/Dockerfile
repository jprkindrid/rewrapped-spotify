FROM stagex/core-sqlite3@sha256:731ebfad1e98bc7dba51c650331136d24f7084acd2fc227e74d99ed735236216 AS sqlite3
FROM stagex/ca-certificates@sha256:a84695f983a448a82acfe78af11f33c6a66b27124266e1fdc3ecfb8dc5852573 AS certificates
FROM stagex/pallet-cgo@sha256:2a7ff594c7c5444e8eb2f1e0500734c6a3e1c57631560d5175f21e08917d2f04 AS builder
# Go version 1.25.5

ENV CGO_ENABLED=1
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN make build

RUN CGO_ENABLED=0 GOBIN=/out go install github.com/pressly/goose/v3/cmd/goose@v3.26.0

FROM stagex/pallet-cgo@sha256:2a7ff594c7c5444e8eb2f1e0500734c6a3e1c57631560d5175f21e08917d2f04 AS runtime
WORKDIR /app

COPY --from=sqlite3 . /
COPY --from=certificates . /

COPY --from=builder /app/app /app/app
COPY --from=builder /app/sql /app/sql
COPY --from=builder /out/goose /usr/local/bin/goose

COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/app/app"]