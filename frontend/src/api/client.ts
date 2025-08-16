import axios from "axios";

// Pakai proxy Vite saat dev → baseURL kosong
export const api = axios.create({ baseURL: "" });
