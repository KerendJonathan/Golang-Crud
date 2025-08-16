import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Plus, Search } from "lucide-react";

export default function Header() {
  const { pathname } = useLocation();
  return (
    <header className="container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-brand-600 text-white grid place-content-center">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">CRUD Mahasiswa</h1>
            <p className="text-xs text-gray-500">
              Golang (Gin) + React + MySQL
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/" className="btn" title="Home">
            <Search size={16} />
            Home
          </Link>
          {pathname !== "/create" && (
            <Link to="/create" className="btn btn-primary" title="Tambah">
              <Plus size={16} />
              Tambah
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
