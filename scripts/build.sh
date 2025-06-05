#!/bin/bash

npx tsc

go build -o out ./cmd && ./out