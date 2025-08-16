export type Mahasiswa = {
  id: number;
  npm: string;
  nama: string;
  kelas: string;
  profile: string;
};

export type ListResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type SingleResponse<T> = { data: T };
