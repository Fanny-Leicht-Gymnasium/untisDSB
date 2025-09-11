# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY . ./

RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -o untisDSB main.go


FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/untisDSB /app/untisDSB


# Copy static files and index.html
COPY static ./static
COPY index.html ./
COPY config ./config

EXPOSE 8080

CMD ["./untisDSB"]
