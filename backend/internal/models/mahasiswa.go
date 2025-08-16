package models

// Sesuai tabel existing `mahasiswa` pada DB goweb
// Kolom: id (PK), npm, nama, kelas, profile
type Mahasiswa struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	NPM     string `json:"npm"`
	Nama    string `json:"nama"`
	Kelas   string `json:"kelas"`
	Profile string `json:"profile"`
}

func (Mahasiswa) TableName() string { return "mahasiswa" }
