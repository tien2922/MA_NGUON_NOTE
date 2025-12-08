import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard"); // Chuyển đến dashboard sau khi đăng nhập thành công
    } else {
      setError(result.error || "Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen text-text-primary-light dark:text-text-primary-dark">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex flex-1 justify-center items-center py-5 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col w-full max-w-md flex-1">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                <span className="material-symbols-outlined text-primary text-3xl">edit_note</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-center mb-8">
              <p className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
                Chào mừng trở lại!
              </p>
              <p className="text-slate-500 dark:text-[#92a4c9] text-base font-normal leading-normal">Đăng nhập để tiếp tục</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal pb-2">Email</p>
                <div className="flex w-full flex-1 items-stretch rounded-lg">
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-slate-300 dark:border-[#324467] bg-white dark:bg-[#192233] focus:border-primary dark:focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-[#92a4c9] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                    placeholder="Nhập email của bạn"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="text-slate-400 dark:text-[#92a4c9] flex border border-slate-300 dark:border-[#324467] bg-white dark:bg-[#192233] items-center justify-center px-4 rounded-r-lg border-l-0">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                </div>
              </label>
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal pb-2">Mật khẩu</p>
                <div className="flex w-full flex-1 items-stretch rounded-lg">
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-slate-300 dark:border-[#324467] bg-white dark:bg-[#192233] focus:border-primary dark:focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-[#92a4c9] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                    placeholder="Nhập mật khẩu của bạn"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    className="text-slate-400 dark:text-[#92a4c9] flex border border-slate-300 dark:border-[#324467] bg-white dark:bg-[#192233] items-center justify-center px-4 rounded-r-lg border-l-0 hover:bg-slate-50 dark:hover:bg-[#1a2332]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </label>
              <p className="text-primary text-sm font-medium leading-normal pb-3 pt-1 text-right underline cursor-pointer hover:no-underline">
                Quên mật khẩu?
              </p>
              <div className="flex py-3 justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal tracking-[0.015em] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
                </button>
              </div>
              <div className="flex items-center justify-center pt-4">
                <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-normal">
                  Chưa có tài khoản?
                  <Link className="font-medium text-primary underline hover:no-underline ml-1" to="/dangky">
                    Đăng ký
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

