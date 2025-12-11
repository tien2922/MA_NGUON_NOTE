import { useState, useEffect } from "react";
import { buildFileUrl } from "../services/api";

export default function NoteEditor({ note, onSave, onClose, onUploadImage }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [imageUrl, setImageUrl] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setColor(note.color || "#ffffff");
      setImageUrl(note.image_url || "");
      if (note.reminder_at) {
        const dt = new Date(note.reminder_at);
        const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setReminderAt(local);
      } else {
        setReminderAt("");
      }
    } else {
      setTitle("");
      setContent("");
      setColor("#ffffff");
      setImageUrl("");
      setReminderAt("");
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề ghi chú");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        is_markdown: true,
        folder_id: null,
        tag_ids: [],
        is_public: false,
        color,
        image_url: imageUrl || null,
        reminder_at: reminderAt ? new Date(reminderAt).toISOString() : null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await onUploadImage(file);
      setImageUrl(url);
    } catch (err) {
      alert("Upload ảnh thất bại: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {note ? "Chỉnh sửa ghi chú" : "Tạo ghi chú mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Tiêu đề
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Nhập tiêu đề ghi chú..."
                required
                disabled={loading}
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Nội dung
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Nhập nội dung ghi chú..."
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Màu ghi chú
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={loading}
                    className="h-10 w-16 rounded cursor-pointer border border-gray-300 dark:border-gray-700"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Ảnh đính kèm (tùy chọn)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={loading || uploading}
                    onChange={(e) => handleUpload(e.target.files?.[0])}
                    className="flex-1 text-sm"
                  />
                </div>
                {uploading && (
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Đang tải ảnh...
                  </p>
                )}
                {imageUrl && (
                  <div className="mt-2">
                    <img
                      src={buildFileUrl(imageUrl)}
                      alt="Ảnh ghi chú"
                      className="max-h-40 rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark break-all mt-1">
                      {imageUrl}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                Nhắc nhở (ngày giờ)
              </label>
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Để trống nếu không cần nhắc.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploading}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {loading || uploading ? "Đang xử lý..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

