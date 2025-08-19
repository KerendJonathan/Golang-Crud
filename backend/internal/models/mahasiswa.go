package models

// Sesuai tabel `mahasiswa` (id, npm, nama, kelas, minat, profile)
type Mahasiswa struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	NPM     string `json:"npm"`
	Nama    string `json:"nama"`
	Kelas   string `json:"kelas"`
	Minat   string `json:"minat"`
	Profile string `json:"profile"`
}

func (Mahasiswa) TableName() string { return "mahasiswa" }
