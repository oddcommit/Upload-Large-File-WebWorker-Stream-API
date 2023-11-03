FROM golang:1.21.3 AS build
WORKDIR /app
COPY . .
RUN env CGO_ENABLED=0 go build -o summer-host-storage main.go

FROM scratch
COPY --from=build /app/summer-host-storage /summer-host-storage
ENTRYPOINT ["/summer-host-storage"]
CMD ["-listen=:8000"]