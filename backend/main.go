package main

import (
	"log"
	"os"

	"goweb-crud/backend/internal/db"
	"goweb-crud/backend/internal/router"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load() // load .env jika ada

	db.Connect()
	r := router.Setup()

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Backend running at http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
