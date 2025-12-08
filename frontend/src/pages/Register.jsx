import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen text-text-primary-light dark:text-text-primary-dark">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">edit_note</span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SmartNote</h1>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">Tạo tài khoản mới</p>
              <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                Bắt đầu sắp xếp ý tưởng của bạn một cách thông minh.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <form className="space-y-6">
              <div>
                <label className="flex flex-col w-full">
                  <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tên người dùng</p>
                  <input
                    className="form-input flex w-full flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-3 text-base font-normal text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Nhập tên người dùng của bạn"
                    type="text"
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
                  />
                </label>
              </div>

              <div>
                <label className="flex flex-col w-full">
                  <p className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</p>
                  <div className="relative flex w-full items-stretch">
                    <input
                      className="form-input flex w-full flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-3 pr-10 text-base font-normal text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Nhập mật khẩu của bạn"
                      type="password"
                    />
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
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
                      type="password"
                    />
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xl">visibility_off</span>
                    </button>
                  </div>
                </label>
              </div>

              <div>
                <button
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
                  type="submit"
                >
                  Đăng ký
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

