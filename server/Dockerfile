FROM stagex/core-sqlite3@sha256:5ae706b4e78071584cf5b87a21d0c95ba1980940a4d22852940698ce40ca6e4c AS sqlite3
FROM stagex/ca-certificates@sha256:a84695f983a448a82acfe78af11f33c6a66b27124266e1fdc3ecfb8dc5852573 AS certificates
FROM stagex/pallet-cgo@sha256:5107dc04ff8d4a8da3aa95f5cfebde90082dd0b0cf998a77f69b31d7eefcb666 AS builder
# Go version 1.26.0

ENV CGO_ENABLED=1
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN make build

RUN CGO_ENABLED=0 GOBIN=/out go install github.com/pressly/goose/v3/cmd/goose@v3.26.0

FROM stagex/pallet-cgo@sha256:5107dc04ff8d4a8da3aa95f5cfebde90082dd0b0cf998a77f69b31d7eefcb666 AS runtime
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