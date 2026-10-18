package main

import (
	"log"
	"net/http"

	"github.com/saranyamaity2000/ByteBattle/APIGatewayService/internal/gateway"
)

func main() {
	config, err := gateway.LoadConfig("config.yaml")
	if err != nil {
		log.Fatal(err)
	}
	handler, err := gateway.NewHandler(config)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("API Gateway listening on %s", config.ListenAddress)
	if err := http.ListenAndServe(config.ListenAddress, handler); err != nil {
		log.Fatal(err)
	}
}
