import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteMahasiswa, listMahasiswa } from "../api/mahasiswa";
import type { Mahasiswa } from "../types/mahasiswa";
import Empty from "../components/Empty";
import { toast } from "sonner";
import confirmDialog from "../components/Confirm";

function useDebounce<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function MahasiswaList() {
  const [rows, setRows] = useState<Mahasiswa[]>([]);
  const [q, setQ] = useState("");
  const qd = useDebounce(q);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  async function load() {
    try {
      setLoading(true);
      const res = await listMahasiswa({ q: qd, page, limit });
      setRows(res.data);
      setTotal(res.total);
    } catch (e: any) {
      toast.error(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, qd]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          className="input max-w-sm"
          placeholder="Cari nama / npm / kelas..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex-1" />
        <Link to="/create" className="btn btn-primary">
          + Tambah
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="w-14">ID</th>
              <th>NPM</th>
              <th>Nama</th>
              <th>Kelas</th>
              <th>Profile</th>
              <th className="w-40">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6}>
                    <div className="skel h-8" />
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <Empty
                    title="Belum ada data"
                    subtitle="Tambahkan data pertama kamu"
                  />
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td>{r.id}</td>
                  <td className="tabular-nums">{r.npm}</td>
                  <td>{r.nama}</td>
                  <td>{r.kelas}</td>
                  <td>
                    {r.profile ? (
                      <img
                        className="h-10 w-10 rounded-lg border object-cover"
                        src={`/uploads/${r.profile}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="space-x-2">
                    <Link to={`/edit/${r.id}`} className="btn">
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={async () => {
                        if (await confirmDialog("Hapus data ini?")) {
                          try {
                            await deleteMahasiswa(r.id);
                            toast.success("Berhasil dihapus");
                            load();
                          } catch (e: any) {
                            toast.error(e?.message || "Gagal hapus");
                          }
                        }
                      }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          className="btn"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span className="text-sm text-gray-500">
          Hal {page} / {totalPages}
        </span>
        <button
          className="btn"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
