import { useState } from "react";
import { shareAPI } from "../services/api";

export default function ShareNoteModal({ note, onClose, onSuccess }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [publicLink, setPublicLink] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Vui lòng nhập tên tài khoản");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await shareAPI.shareNoteWithUser(note.id, username.trim());
      setUsername("");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi share note");
    } finally {
      setLoading(false);
    }
  };

  const createLink = async () => {
    setLinkLoading(true);
    setCopyStatus("");
    try {
      const payloadMinutes = expiresInMinutes ? Number(expiresInMinutes) : null;
      const data = await shareAPI.createPublicLink(note.id, payloadMinutes, true);
      // Chuyển đổi URL từ backend sang frontend
      const backendUrl = new URL(data.url);
      const frontendUrl = `${window.location.origin}/share/public/${backendUrl.pathname.split('/').pop()}`;
      setPublicLink(frontendUrl);
    } catch (err) {
      setError(err.message || "Không tạo được link công khai");
    } finally {
      setLinkLoading(false);
    }
  };

  const copyLink = async () => {
    if (!publicLink) return;
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopyStatus("Đã copy");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Không copy được");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Share ghi chú
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Ghi chú: <span className="font-semibold">{note.title}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Tên tài khoản người nhận
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Nhập username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang gửi..." : "Share"}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                Tạo link công khai
              </h3>
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Có thể đặt thời gian hết hạn (phút)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max={60 * 24 * 30}
                value={expiresInMinutes}
                onChange={(e) => setExpiresInMinutes(e.target.value)}
                placeholder="Hết hạn (phút, tùy chọn)"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={createLink}
                disabled={linkLoading}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {linkLoading ? "Đang tạo..." : "Tạo link"}
              </button>
            </div>
            {publicLink && (
              <div className="space-y-2">
                <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark break-all">
                  {publicLink}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Copy link
                  </button>
                  {copyStatus && (
                    <span className="text-xs text-green-600 dark:text-green-400">{copyStatus}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

