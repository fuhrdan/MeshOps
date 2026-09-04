FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod main.go ./
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /auth .
FROM scratch
COPY --from=build /auth /auth
EXPOSE 8080
ENTRYPOINT ["/auth"]
