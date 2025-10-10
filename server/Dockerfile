
FROM stagex/pallet-go AS builder

COPY --from=stagex/pallet-gcc . /

ENV CGO_ENABLED=1
ENV GOBIN=/app/bin

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o app ./cmd
RUN go install github.com/pressly/goose/v3/cmd/goose@f2b5a9d8bcd75d257ff9b484e79e2edb94dd0b8c

FROM stagex/pallet-gcc-gnu-busybox


USER root
COPY --from=stagex/core-sqlite3 . /
COPY --from=stagex/core-bash . /
COPY --from=stagex/core-ca-certificates . /

WORKDIR /app
COPY --from=builder /app/app .
COPY --from=builder /app/web ./web
COPY --from=builder /app/sql ./sql
# COPY --from=builder /app/bin/goose /usr/local/bin/goose 
COPY --from=builder /go/bin/goose /usr/local/bin/goose

COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["./app"]