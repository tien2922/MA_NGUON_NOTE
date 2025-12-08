import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (username.length < 3) {
      setError("Tên đăng nhập phải có ít nhất 3 ký tự");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard"); // Chuyển đến dashboard sau khi đăng ký thành công
    } else {
      setError(result.error || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen text-text-primary-light dark:text-text-primary-dark">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">edit_note</span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chí Tường Smart</h1>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">Tạo tài khoản mới</p>
              <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                Bắt đầu sắp xếp ý tưởng của bạn một cách thông minh.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="flex flex-col w-full">
                  <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tên đăng nhập</p>
                  <input
                    className="form-input flex w-full flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-3 text-base font-normal text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Nhập tên đăng nhập của bạn (tối thiểu 3 ký tự)"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </label>
              </div>

              <div>
                <label className="flex flex-col w-full">
                  <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ Email</p>
                  <input
                    className="form-input flex w-full flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-3 text-base font-normal text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Nhập địa chỉ email của bạn"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </label>
              </div>

              <div>
                <label className="flex flex-col w-full">
                  <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</p>
                  <div className="relative flex w-full items-stretch">
                    <input
                      className="form-input flex w-full flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-3 pr-10 text-base font-normal text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Nhập mật khẩu của bạn (tối thiểu 6 ký tự)"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </label>
              </div>

              <div>
                <label className="flex flex-col w-full">
                  <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Xác nhận mật khẩu</p>
                  <div className="relative flex w-full items-stretch">
                    <input
                      className="form-input flex w-full flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-3 pr-10 text-base font-normal text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Nhập lại mật khẩu của bạn"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <span className="material-symbols-outlined text-xl">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đã có tài khoản?
              <Link
                className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark rounded-sm ml-1"
                to="/dangnhap"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

