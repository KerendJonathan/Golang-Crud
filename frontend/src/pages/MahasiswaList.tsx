import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteMahasiswa, listMahasiswa } from "../api/mahasiswa";
import type { Mahasiswa } from "../types/mahasiswa";
import Empty from "../components/Empty";
import { toast } from "sonner";
import { Search, Plus, Trash2, Pencil } from "lucide-react";
import { useConfirm } from "../components/useConfirm"; // ← gunakan modal

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

  const { confirm, ConfirmDialog } = useConfirm(); // ← inisialisasi modal

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, qd]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total]
  );

  const clearSearch = () => {
    setQ("");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Render modal sekali di root halaman */}
      <ConfirmDialog />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Cari nama / NPM / kelas / minat…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1.5 text-xs px-2 py-1 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200"
              title="Bersihkan"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex-1" />
        <div className="text-xs text-gray-500 hidden sm:block">
          Total: <span className="font-medium">{total}</span> data
        </div>
        <Link to="/create" className="btn btn-primary">
          <Plus size={16} /> Tambah
        </Link>
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                <th className="w-14">ID</th>
                <th>NPM</th>
                <th>Nama</th>
                <th className="hidden md:table-cell">Kelas</th>
                <th className="hidden sm:table-cell">Minat</th>
                <th className="hidden sm:table-cell">Profil</th>
                <th className="w-44 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {/* Loading skeleton */}
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7}>
                      <div className="h-8 skel" />
                    </td>
                  </tr>
                ))}

              {/* Empty state */}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <Empty
                      title={qd ? "Data tidak ditemukan" : "Belum ada data"}
                      subtitle={
                        qd
                          ? "Coba ubah kata kunci pencarian"
                          : "Tambahkan data pertama kamu"
                      }
                    />
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading &&
                rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={idx % 2 ? "bg-white" : "bg-gray-50/50"}
                  >
                    <td className="text-gray-500">{r.id}</td>
                    <td className="font-mono text-sm">{r.npm}</td>

                    <td>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                          {r.profile ? (
                            <img
                              className="h-9 w-9 rounded-full border object-cover"
                              src={`/uploads/${r.profile}`}
                              alt={r.nama}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-gray-200 border grid place-content-center text-xs text-gray-500">
                              —
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium">{r.nama}</div>
                          {/* info ringkas saat layar kecil */}
                          <div className="text-xs text-gray-500 sm:hidden">
                            {r.kelas} • {r.minat || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="hidden md:table-cell">{r.kelas}</td>

                    {/* Minat as chips */}
                    <td className="hidden sm:table-cell">
                      {r.minat ? (
                        <div className="flex flex-wrap gap-1">
                          {r.minat
                            .split(",")
                            .map((m) => m.trim())
                            .filter(Boolean)
                            .map((m, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs border border-gray-200 bg-gray-50"
                              >
                                {m}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    <td className="hidden sm:table-cell">
                      {r.profile ? (
                        <img
                          className="h-10 w-10 rounded-lg border object-cover"
                          src={`/uploads/${r.profile}`}
                          alt={r.nama}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-right space-x-2">
                      <Link
                        to={`/edit/${r.id}`}
                        className="btn"
                        title={`Edit ${r.nama}`}
                      >
                        <Pencil size={16} />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                      <button
                        className="btn btn-danger"
                        title={`Hapus ${r.nama}`}
                        onClick={async () => {
                          const ok = await confirm({
                            title: "Hapus data?",
                            description: `Data "${r.nama}" akan dihapus permanen.`,
                            confirmText: "Ya, hapus",
                            cancelText: "Batal",
                            danger: true,
                          });
                          if (ok) {
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
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer: pagination */}
        <div className="flex flex-col sm:flex-row items-center gap-2 justify-between p-3 border-t">
          <div className="text-xs text-gray-500 w-full sm:w-auto">
            Menampilkan {rows.length} dari {total} data
          </div>
          <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}
