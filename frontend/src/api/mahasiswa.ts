import { api } from "./client";
import type {
  ListResponse,
  Mahasiswa,
  SingleResponse,
} from "../types/mahasiswa";

export async function listMahasiswa(
  params: { q?: string; page?: number; limit?: number } = {}
) {
  const res = await api.get<ListResponse<Mahasiswa>>("/api/mahasiswa", {
    params,
  });
  return res.data;
}

export async function getMahasiswa(id: string | number) {
  const res = await api.get<SingleResponse<Mahasiswa>>(`/api/mahasiswa/${id}`);
  return res.data;
}

export async function createMahasiswaJSON(body: Partial<Mahasiswa>) {
  const res = await api.post<SingleResponse<Mahasiswa>>(
    "/api/mahasiswa",
    body,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
}

export async function createMahasiswaForm(fd: FormData) {
  const res = await api.post<SingleResponse<Mahasiswa>>("/api/mahasiswa", fd);
  return res.data;
}

export async function updateMahasiswaJSON(
  id: string | number,
  body: Partial<Mahasiswa>
) {
  const res = await api.put<SingleResponse<Mahasiswa>>(
    `/api/mahasiswa/${id}`,
    body,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
}

export async function updateMahasiswaForm(id: string | number, fd: FormData) {
  const res = await api.put<SingleResponse<Mahasiswa>>(
    `/api/mahasiswa/${id}`,
    fd
  );
  return res.data;
}

export async function deleteMahasiswa(id: string | number) {
  await api.delete(`/api/mahasiswa/${id}`);
}
