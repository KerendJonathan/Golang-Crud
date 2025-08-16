import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createMahasiswaForm,
  createMahasiswaJSON,
  getMahasiswa,
  updateMahasiswaForm,
  updateMahasiswaJSON,
} from "../api/mahasiswa";
import { toast } from "sonner";

const schema = z.object({
  npm: z.string().min(8, "NPM 8 digit").max(8, "NPM 8 digit"),
  nama: z.string().min(1, "Nama wajib"),
  kelas: z.string().min(1, "Kelas wajib"),
});

type FormValues = z.infer<typeof schema>;

export default function MahasiswaForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [preview, setPreview] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { npm: "", nama: "", kelas: "" },
  });

  useEffect(() => {
    (async () => {
      if (isEdit && id) {
        const { data } = await getMahasiswa(id);
        setValue("npm", data.npm);
        setValue("nama", data.nama);
        setValue("kelas", data.kelas);
        if (data.profile) setPreview(`/uploads/${data.profile}`);
      }
    })();
  }, [id, isEdit]);

  const onSubmit = async (v: FormValues) => {
    try {
      const file = fileRef.current?.files?.[0];
      if (file) {
        const fd = new FormData();
        fd.append("npm", v.npm);
        fd.append("nama", v.nama);
        fd.append("kelas", v.kelas);
        fd.append("profile", file);
        if (isEdit && id) await updateMahasiswaForm(id, fd);
        else await createMahasiswaForm(fd);
      } else {
        if (isEdit && id) await updateMahasiswaJSON(id, v);
        else await createMahasiswaJSON(v);
      }
      toast.success(isEdit ? "Berhasil diperbarui" : "Berhasil ditambahkan");
      nav("/");
    } catch (e: any) {
      toast.error(e?.message || "Gagal menyimpan");
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">NPM</label>
          <input
            className="input"
            maxLength={8}
            placeholder="12345678"
            {...register("npm")}
          />
          {errors.npm && (
            <p className="text-red-600 text-xs mt-1">{errors.npm.message}</p>
          )}
        </div>
        <div>
          <label className="label">Nama</label>
          <input
            className="input"
            placeholder="Nama lengkap"
            {...register("nama")}
          />
          {errors.nama && (
            <p className="text-red-600 text-xs mt-1">{errors.nama.message}</p>
          )}
        </div>
        <div>
          <label className="label">Kelas</label>
          <input className="input" placeholder="4IA17" {...register("kelas")} />
          {errors.kelas && (
            <p className="text-red-600 text-xs mt-1">{errors.kelas.message}</p>
          )}
        </div>
        <div>
          <label className="label">Profile (foto, opsional)</label>
          <input
            className="block"
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
          {preview && (
            <img
              src={preview}
              className="mt-2 h-24 w-24 rounded-xl border object-cover"
            />
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-primary" type="submit">
          Simpan
        </button>
        <button type="button" className="btn" onClick={() => nav(-1)}>
          Batal
        </button>
      </div>
    </form>
  );
}
