package handlers

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	dbpkg "goweb-crud/backend/internal/db"
	"goweb-crud/backend/internal/models"
	"goweb-crud/backend/internal/utils"
)

type mahasiswaPayload struct {
	NPM     string `json:"npm"`
	Nama    string `json:"nama"`
	Kelas   string `json:"kelas"`
	Minat   string `json:"minat"`
	Profile string `json:"profile"` // opsional: nama file (bukan upload)
}

func isJSON(c *gin.Context) bool {
	ct := strings.ToLower(c.GetHeader("Content-Type"))
	return strings.HasPrefix(ct, "application/json")
}

func ListMahasiswa(c *gin.Context) {
	q := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	var items []models.Mahasiswa
	var total int64

	query := dbpkg.Conn.Model(&models.Mahasiswa{})
	if q != "" {
		like := "%" + strings.TrimSpace(q) + "%"
		query = query.Where(
			"npm LIKE ? OR nama LIKE ? OR kelas LIKE ? OR minat LIKE ?",
			like, like, like, like,
		)
	}
	query.Count(&total)
	if err := query.Order("id DESC").Limit(limit).Offset((page - 1) * limit).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, utils.ListResponse[models.Mahasiswa]{
		Data:  items,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

func GetMahasiswa(c *gin.Context) {
	id := c.Param("id")
	var item models.Mahasiswa
	if err := dbpkg.Conn.First(&item, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, utils.ErrorResponse{Error: "Not found"})
		} else {
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, utils.SingleResponse[models.Mahasiswa]{Data: item})
}

// ==== Create: dukung JSON & multipart/form-data ====
func CreateMahasiswa(c *gin.Context) {
	var item models.Mahasiswa

	if isJSON(c) {
		var p mahasiswaPayload
		if err := c.ShouldBindJSON(&p); err != nil {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "JSON tidak valid"})
			return
		}
		p.NPM = strings.TrimSpace(p.NPM)
		p.Nama = strings.TrimSpace(p.Nama)
		p.Kelas = strings.TrimSpace(p.Kelas)
		p.Minat = strings.TrimSpace(p.Minat)

		if len(p.NPM) != 8 || p.Nama == "" || p.Kelas == "" || p.Minat == "" {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Field tidak valid (npm 8 digit, nama/kelas/minat wajib)"})
			return
		}

		item = models.Mahasiswa{
			NPM:     p.NPM,
			Nama:    p.Nama,
			Kelas:   p.Kelas,
			Minat:   p.Minat,
			Profile: p.Profile, // string saja di mode JSON
		}
	} else {
		npm := strings.TrimSpace(c.PostForm("npm"))
		nama := strings.TrimSpace(c.PostForm("nama"))
		kelas := strings.TrimSpace(c.PostForm("kelas"))
		minat := strings.TrimSpace(c.PostForm("minat"))
		if len(npm) != 8 || nama == "" || kelas == "" || minat == "" {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "Field tidak valid (npm 8 digit, nama/kelas/minat wajib)"})
			return
		}
		item = models.Mahasiswa{NPM: npm, Nama: nama, Kelas: kelas, Minat: minat}

		if fh, err := c.FormFile("profile"); err == nil && fh != nil {
			saved, saveErr := saveUpload(fh)
			if saveErr != nil {
				c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: saveErr.Error()})
				return
			}
			item.Profile = saved
		} else if v := c.PostForm("profile"); v != "" {
			item.Profile = v
		}
	}

	if err := dbpkg.Conn.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, utils.SingleResponse[models.Mahasiswa]{Data: item})
}

// ==== Update: dukung JSON & multipart/form-data ====
func UpdateMahasiswa(c *gin.Context) {
	id := c.Param("id")
	var item models.Mahasiswa
	if err := dbpkg.Conn.First(&item, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, utils.ErrorResponse{Error: "Not found"})
		} else {
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
		}
		return
	}

	if isJSON(c) {
		var p mahasiswaPayload
		if err := c.ShouldBindJSON(&p); err != nil {
			c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: "JSON tidak valid"})
			return
		}
		if v := strings.TrimSpace(p.NPM); v != "" {
			if len(v) != 8 {
				c.JSON(400, utils.ErrorResponse{Error: "npm harus 8 digit"})
				return
			}
			item.NPM = v
		}
		if v := strings.TrimSpace(p.Nama); v != "" {
			item.Nama = v
		}
		if v := strings.TrimSpace(p.Kelas); v != "" {
			item.Kelas = v
		}
		if v := strings.TrimSpace(p.Minat); v != "" {
			item.Minat = v
		}
		if v := strings.TrimSpace(p.Profile); v != "" {
			item.Profile = v
		}
	} else {
		if v := strings.TrimSpace(c.PostForm("npm")); v != "" {
			if len(v) != 8 {
				c.JSON(400, utils.ErrorResponse{Error: "npm harus 8 digit"})
				return
			}
			item.NPM = v
		}
		if v := strings.TrimSpace(c.PostForm("nama")); v != "" {
			item.Nama = v
		}
		if v := strings.TrimSpace(c.PostForm("kelas")); v != "" {
			item.Kelas = v
		}
		if v := strings.TrimSpace(c.PostForm("minat")); v != "" {
			item.Minat = v
		}

		if fh, err := c.FormFile("profile"); err == nil && fh != nil {
			if item.Profile != "" {
				_ = os.Remove(filepath.Join(os.Getenv("APP_UPLOAD_DIR"), item.Profile))
			}
			saved, saveErr := saveUpload(fh)
			if saveErr != nil {
				c.JSON(http.StatusBadRequest, utils.ErrorResponse{Error: saveErr.Error()})
				return
			}
			item.Profile = saved
		} else if v := c.PostForm("profile"); v != "" {
			item.Profile = v
		}
	}

	if err := dbpkg.Conn.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, utils.SingleResponse[models.Mahasiswa]{Data: item})
}

func DeleteMahasiswa(c *gin.Context) {
	id := c.Param("id")
	var item models.Mahasiswa
	if err := dbpkg.Conn.First(&item, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, utils.ErrorResponse{Error: "Not found"})
		} else {
			c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
		}
		return
	}

	if err := dbpkg.Conn.Delete(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse{Error: err.Error()})
		return
	}

	if item.Profile != "" {
		_ = os.Remove(filepath.Join(os.Getenv("APP_UPLOAD_DIR"), item.Profile))
	}
	c.Status(http.StatusNoContent)
}

func saveUpload(fh *multipart.FileHeader) (string, error) {
	if fh.Size > 2*1024*1024 {
		return "", fmt.Errorf("file terlalu besar (maks 2MB)")
	}
	ext := strings.ToLower(filepath.Ext(fh.Filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp":
	default:
		return "", fmt.Errorf("ekstensi tidak didukung")
	}

	uploadDir := os.Getenv("APP_UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", err
	}

	name := time.Now().Format("20060102_150405") + fmt.Sprintf("_%d%s", time.Now().UnixNano()%1000, ext)
	dst := filepath.Join(uploadDir, name)

	src, err := fh.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	out, err := os.Create(dst)
	if err != nil {
		return "", err
	}
	defer out.Close()

	if _, err := io.Copy(out, src); err != nil {
		return "", err
	}
	return name, nil
}
