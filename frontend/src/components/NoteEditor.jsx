import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { buildFileUrl } from "../services/api";

export default function NoteEditor({
  note,
  selectedFolderId,
  onSave,
  onClose,
  onUploadImage,
  availableTags = [],
  onCreateTag,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [imageUrl, setImageUrl] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(""); // "saving" | "saved" | ""
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedRef = useRef({ title: "", content: "" });
  const editorRef = useRef(null);

  const toLocalInput = (isoString) => {
    if (!isoString) return "";
    const dt = new Date(isoString);
    if (Number.isNaN(dt.getTime())) return "";
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  // Convert Markdown to HTML (đơn giản)
  const markdownToHtml = (md) => {
    if (!md) return "";
    let html = md
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
    return html;
  };

  // Convert HTML to Markdown (đơn giản)
  const htmlToMarkdown = (html) => {
    if (!html) return "";
    let md = html
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i>(.*?)<\/i>/gi, "*$1*")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<div>(.*?)<\/div>/gi, "$1\n")
      .replace(/&nbsp;/gi, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&");
    return md.trim();
  };

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setColor(note.color || "#ffffff");
      setImageUrl(note.image_url || "");
      setReminderAt(toLocalInput(note.reminder_at));
      setSelectedTagIds(note.tags ? note.tags.map((t) => t.id) : []);
      lastSavedRef.current = { title: note.title || "", content: note.content || "" };
    } else {
      setTitle("");
      setContent("");
      setColor("#ffffff");
      setImageUrl("");
      setReminderAt("");
      setSelectedTagIds([]);
      lastSavedRef.current = { title: "", content: "" };
    }
    setAutoSaveStatus("");

    // Update editor content khi content thay đổi
    setTimeout(() => {
      if (editorRef.current) {
        const contentToShow = note?.content || "";
        const htmlContent = markdownToHtml(contentToShow);
        editorRef.current.innerHTML = htmlContent || "";
      }
    }, 0);
  }, [note]);

  // Auto-save function với debounce
  const autoSave = useCallback(async () => {
    if (!note) return; // Chỉ auto-save khi đang edit note cũ, không phải tạo mới

    const currentTitle = title.trim();
    const currentContent = content.trim();

    // Kiểm tra xem có thay đổi không
    if (
      currentTitle === lastSavedRef.current.title &&
      currentContent === lastSavedRef.current.content
    ) {
      return; // Không có thay đổi, không cần save
    }

    if (!currentTitle) return; // Không save nếu chưa có title

    setAutoSaveStatus("saving");
    try {
      await onSave({
        title: currentTitle,
        content: currentContent,
        is_markdown: true,
        folder_id: note.folder_id || selectedFolderId || null,
        tag_ids: selectedTagIds,
        is_public: note.is_public || false,
        color,
        image_url: imageUrl || null,
        reminder_at: reminderAt ? new Date(reminderAt).toISOString() : null,
      }, true); // true = auto-save mode
      lastSavedRef.current = { title: currentTitle, content: currentContent };
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus(""), 2000);
    } catch (error) {
      console.error("Auto-save error:", error);
      setAutoSaveStatus("");
    }
  }, [note, title, content, color, imageUrl, reminderAt, onSave]);

  // Debounce auto-save khi title hoặc content thay đổi
  useEffect(() => {
    if (!note) return; // Chỉ auto-save khi edit note cũ

    // Clear timeout cũ
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set timeout mới - auto-save sau 2 giây không gõ
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, note, autoSave]);

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
        folder_id: note?.folder_id || selectedFolderId || null,
        tag_ids: selectedTagIds,
        is_public: note?.is_public || false,
        color,
        image_url: imageUrl || null,
        reminder_at: reminderAt ? new Date(reminderAt).toISOString() : null,
      }, false); // false = manual save
      lastSavedRef.current = { title: title.trim(), content: content.trim() };
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

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!onCreateTag || !newTagName.trim()) return;
    try {
      setCreatingTag(true);
      const created = await onCreateTag(newTagName.trim());
      setSelectedTagIds((prev) => [...prev, created.id]);
      setNewTagName("");
    } catch (err) {
      alert("Không tạo được tag: " + err.message);
    } finally {
      setCreatingTag(false);
    }
  };


  const formatText = (formatType) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    if (formatType === "bold") {
      document.execCommand("bold", false, null);
    } else if (formatType === "italic") {
      document.execCommand("italic", false, null);
    }

    // Update content state từ HTML
    const htmlContent = editor.innerHTML;
    const markdownContent = htmlToMarkdown(htmlContent);
    setContent(markdownContent);
  };

  const handleEditorInput = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const htmlContent = editor.innerHTML;
    const markdownContent = htmlToMarkdown(htmlContent);
    setContent(markdownContent);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {note ? "Chỉnh sửa ghi chú" : "Tạo ghi chú mới"}
            </h2>
            {note && autoSaveStatus && (
              <span className={`text-xs ${autoSaveStatus === "saving" ? "text-yellow-500" : "text-green-500"
                }`}>
                {autoSaveStatus === "saving" ? "Đang lưu..." : "Đã lưu"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {note && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${showPreview
                  ? "bg-primary text-white"
                  : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10"
                  }`}
              >
                {showPreview ? "Chỉnh sửa" : "Xem trước"}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
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

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Nội dung
                </label>
                <div className="flex items-center gap-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  <button
                    type="button"
                    className="px-2 py-1 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => formatText("bold")}
                    title="In đậm (Ctrl+B)"
                  >
                    <span className="font-bold">B</span>
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 rounded-md hover:bg-primary/10 hover:text-primary transition-colors italic"
                    onClick={() => formatText("italic")}
                    title="In nghiêng (Ctrl+I)"
                  >
                    <span className="italic">I</span>
                  </button>
                </div>
              </div>

              {showPreview ? (
                <div className="w-full h-64 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 overflow-y-auto prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "_(Trống)_"}</ReactMarkdown>
                </div>
              ) : (
                <div className="relative">
                  <div
                    ref={editorRef}
                    contentEditable={!loading}
                    onInput={handleEditorInput}
                    onBlur={handleEditorInput}
                    className="w-full h-64 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm min-h-[256px] overflow-y-auto"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word"
                    }}
                    data-placeholder="Nhập nội dung ghi chú... (Nhấn B để in đậm, I để in nghiêng)"
                  />
                  <style>{`
                    [contenteditable][data-placeholder]:empty:before {
                      content: attr(data-placeholder);
                      color: #9ca3af;
                      pointer-events: none;
                    }
                    [contenteditable]:focus {
                      outline: none;
                    }
                  `}</style>
                </div>
              )}
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
                    <div className="relative">
                      <img
                        src={buildFileUrl(imageUrl)}
                        alt="Ảnh ghi chú"
                        className="max-h-40 rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorDiv = e.target.nextSibling;
                          if (errorDiv) errorDiv.style.display = 'flex';
                        }}
                      />
                      <div className="hidden max-h-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-red-500 text-sm p-4">
                        Không thể tải ảnh. File có thể đã bị xóa.
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark break-all mt-1">
                      {imageUrl}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Tags
                </label>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Chọn nhiều tags để phân loại
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.length === 0 && (
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Chưa có tag nào
                  </span>
                )}
                {availableTags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedTagIds.includes(tag.id)
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 dark:border-gray-700 text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary"
                      }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
              {onCreateTag && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tên tag mới..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={creatingTag}
                  />
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={creatingTag || !newTagName.trim()}
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creatingTag ? "Đang tạo..." : "Thêm tag"}
                  </button>
                </div>
              )}
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

