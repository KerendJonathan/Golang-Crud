import { Outlet } from "react-router-dom";
import Header from "./components/Header";

export default function App() {
  return (
    <div>
      <Header />
      <main className="container">
        <div className="card p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
