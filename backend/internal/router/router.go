package router

import (
	"net/http"
	"os"

	"goweb-crud/backend/internal/handlers"
	"goweb-crud/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func Setup() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	uploadDir := os.Getenv("APP_UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	r.Static("/uploads", uploadDir)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		api.GET("/mahasiswa", handlers.ListMahasiswa)
		api.GET("/mahasiswa/:id", handlers.GetMahasiswa)
		api.POST("/mahasiswa", handlers.CreateMahasiswa)
		api.PUT("/mahasiswa/:id", handlers.UpdateMahasiswa)
		api.DELETE("/mahasiswa/:id", handlers.DeleteMahasiswa)
	}

	return r
}
