.PHONY: build run migrate-up migrate-down clean

build:
	go build -o app ./cmd

run: build
	./app

migrate-up:
	goose -dir sql/schema sqlite3 data/userdata.sqlite up

migrate-down:
	goose -dir sql/schema sqlite3 data/userdata.sqlite down

clean:
	rm -f app