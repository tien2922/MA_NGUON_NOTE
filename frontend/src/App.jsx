import { Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MoreInfo from "./pages/MoreInfo";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dangnhap" element={<Login />} />
      <Route path="/dangky" element={<Register />} />
      <Route path="/timhieuthem" element={<MoreInfo />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
            <div className="text-center space-y-4">
              <p className="text-3xl font-bold">404 - Không tìm thấy trang</p>
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-white font-semibold hover:bg-primary/90"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

