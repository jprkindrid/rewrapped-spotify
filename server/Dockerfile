FROM golang:1.25 AS builder

RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

ENV CGO_ENABLED=1
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o app ./cmd

RUN CGO_ENABLED=0 go install github.com/pressly/goose/v3/cmd/goose@latest

FROM debian:bookworm-slim

WORKDIR /app
RUN apt-get update && apt-get install -y bash sqlite3 ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/app .
COPY --from=builder /app/sql ./sql
COPY --from=builder /go/bin/goose /usr/local/bin/goose
COPY scripts/entrypoint.sh /entrypoint.sh

RUN curl -sSfL https://get.tur.so/install.sh | bash
RUN chmod +x /entrypoint.sh
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/app/app"]