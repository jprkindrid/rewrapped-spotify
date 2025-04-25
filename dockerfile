FROM golang:1.24-alpine AS builder

# Install C compiler and build tools for sqlite3
RUN apk add --no-cache gcc musl-dev

# Enable CGO for sqlite3
ENV CGO_ENABLED=1

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o app ./cmd
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

FROM alpine:3.21

# Install sqlite runtime libraries and bash
RUN apk add --no-cache sqlite-libs bash

WORKDIR /app
COPY --from=builder /app/app .
COPY --from=builder /app/web ./web
COPY --from=builder /app/sql ./sql
COPY --from=builder /go/bin/goose /usr/local/bin/goose
COPY scripts/entrypoint.sh /entrypoint.sh

# Create data directory with world-writable permissions
RUN mkdir /data && chmod 777 /data

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["./app"]
