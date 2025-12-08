import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen text-text-primary-light dark:text-text-primary-dark">
      <div className="flex h-screen w-full">
        {/* SideNavBar */}
        <aside className="flex h-full w-64 shrink-0 flex-col bg-card-light dark:bg-card-dark p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col px-3 pt-2">
              <h1 className="text-text-primary-light dark:text-text-primary-dark text-base font-bold leading-normal">
                Ghi Chú Thông Minh
              </h1>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
                Không gian cá nhân của bạn
              </p>
              {user && (
                <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  👤 {user.username}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary transition-colors"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard");
                }}
              >
                <span className="material-symbols-outlined">description</span>
                <p className="text-sm font-medium leading-normal">Tất cả ghi chú</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <span className="material-symbols-outlined fill">settings</span>
                <p className="text-sm font-medium leading-normal">Cài đặt</p>
              </a>
            </div>
          </div>
          <div className="mt-auto">
            <button
              className="flex w-full mt-2 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-red-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-600 transition-colors"
              onClick={() => {
                logout();
                navigate("/dangnhap");
              }}
            >
              <span className="truncate">Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-8">
              Cài đặt
            </h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "profile"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary-light dark:text-text-secondary-dark"
                }`}
              >
                Hồ sơ
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "security"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary-light dark:text-text-secondary-dark"
                }`}
              >
                Bảo mật
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "preferences"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary-light dark:text-text-secondary-dark"
                }`}
              >
                Tùy chọn
              </button>
            </div>

            {/* Content */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    Thông tin cá nhân
                  </h2>
                  {user && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                          Tên đăng nhập
                        </label>
                        <input
                          type="text"
                          value={user.username}
                          disabled
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                          Ngày tham gia
                        </label>
                        <input
                          type="text"
                          value={new Date(user.created_at).toLocaleDateString("vi-VN")}
                          disabled
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    Bảo mật
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Tính năng đổi mật khẩu sẽ được thêm trong phiên bản tiếp theo.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    Tùy chọn
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                          Chế độ tối
                        </p>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                          Chuyển đổi giữa chế độ sáng và tối
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          document.documentElement.classList.toggle("dark");
                        }}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                      >
                        Chuyển đổi
                      </button>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Các tùy chọn khác sẽ được thêm trong phiên bản tiếp theo.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

