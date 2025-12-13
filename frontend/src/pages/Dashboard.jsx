import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { notesAPI, buildFileUrl, searchAPI, tagsAPI } from "../services/api";
import NoteEditor from "../components/NoteEditor";
import FolderTree from "../components/FolderTree";
import ShareNoteModal from "../components/ShareNoteModal";
import NotificationsPanel from "../components/NotificationsPanel";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [view, setView] = useState("all"); // all | trash
  const [sortBy, setSortBy] = useState("recent"); // recent | title
  const [hasImageOnly, setHasImageOnly] = useState(false);
  const [pinFilter, setPinFilter] = useState("all"); // all | pinned | unpinned
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    noteId: null,
    mode: "trash", // trash | delete
  });
  const [toast, setToast] = useState({ open: false, type: "success", message: "" });
  const [shareModal, setShareModal] = useState({ open: false, note: null });
  const { logout, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    // Đợi auth loading xong mới check
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate("/dangnhap");
      return;
    }
    fetchNotes(view);
    fetchTags();
  }, [isAuthenticated, authLoading, navigate, view, selectedFolderId]);

  useEffect(() => {
    if (view === "trash") {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      return;
    }
    setSearchLoading(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchAPI.searchNotes(q);
        setSearchResults(data);
      } catch (error) {
        console.error("Search error:", error);
        setToast({ open: true, type: "error", message: "Không tìm kiếm được, thử lại sau" });
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, view]);

  const fetchNotes = async (mode = "all") => {
    try {
      setLoading(true);
      if (mode === "trash") {
        const data = await notesAPI.getTrash();
        setNotes(data);
      } else {
        const data = await notesAPI.getNotes(selectedFolderId);
        setNotes(data);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      // Nếu lỗi 401, đăng xuất và chuyển về trang đăng nhập
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        logout();
        navigate("/dangnhap");
      } else {
        setToast({ open: true, type: "error", message: "Không tải được ghi chú" });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const data = await tagsAPI.getTags();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Cập nhật ${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `Cập nhật ${diffHours} giờ trước`;
    } else if (diffDays === 1) {
      return "Cập nhật hôm qua";
    } else if (diffDays < 7) {
      return `Cập nhật ${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Tìm kiếm notes
  const filteredNotes = useMemo(() => {
    const baseList =
      view !== "trash" && searchQuery.trim().length >= 2 ? searchResults : notes;
    const lower = searchQuery.toLowerCase();
    let result = baseList.filter((note) => {
      // Nếu đang dùng search API, đã lọc server theo q; chỉ apply folder filter và các toggle
      const title = (note.title || "").toLowerCase();
      const body = (note.content || "").toLowerCase();
      const match = searchQuery.trim().length >= 2 ? true : title.includes(lower) || body.includes(lower);
      const imageOk = hasImageOnly ? !!(note.image_url && note.image_url.length > 0) : true;
      const pinOk =
        pinFilter === "all" ? true : pinFilter === "pinned" ? note.is_pinned : !note.is_pinned;
      const folderOk =
        selectedFolderId === null || note.folder_id === selectedFolderId;
      return match && imageOk && pinOk && folderOk;
    });

    if (sortBy === "title") {
      result = [...result].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return (a.title || "").localeCompare(b.title || "");
      });
    } else {
      result = [...result].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
    }

    return result;
  }, [notes, searchQuery, hasImageOnly, sortBy, pinFilter]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowNoteEditor(true);
  };

  const handleCreateTag = async (name) => {
    const created = await tagsAPI.createTag(name);
    setTags((prev) => [...prev, created]);
    return created;
  };

  const handleViewNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditingNote(note);
      setShowNoteEditor(true);
    }
  };

  const confirmDelete = (noteId) => {
    setConfirmModal({
      open: true,
      noteId,
      mode: view === "trash" ? "delete" : "trash",
    });
  };

  const handleDeleteNote = async () => {
    if (!confirmModal.noteId) return;
    try {
      if (confirmModal.mode === "delete") {
        await notesAPI.forceDeleteNote(confirmModal.noteId);
        } else {
        await notesAPI.deleteNote(confirmModal.noteId);
        }
        await fetchNotes(view);
      setToast({
        open: true,
        type: "success",
        message: confirmModal.mode === "delete" ? "Đã xóa vĩnh viễn" : "Đã chuyển vào thùng rác",
      });
      } catch (error) {
      setToast({ open: true, type: "error", message: "Lỗi khi xóa ghi chú" });
    } finally {
      setConfirmModal({ open: false, noteId: null, mode: "trash" });
    }
  };

  const handleRestoreNote = async (noteId) => {
    try {
      await notesAPI.restoreNote(noteId);
      await fetchNotes(view);
      setToast({ open: true, type: "success", message: "Đã khôi phục ghi chú" });
    } catch (error) {
      setToast({ open: true, type: "error", message: "Lỗi khi khôi phục ghi chú" });
    }
  };

  const handleSaveNote = async (noteData, isAutoSave = false) => {
    try {
      if (editingNote) {
        // Cập nhật note
        const updated = await notesAPI.updateNote(editingNote.id, noteData);
        // Cập nhật editingNote để sync với data mới
        setEditingNote(updated);
      } else {
        // Tạo note mới
        const newNote = await notesAPI.createNote(noteData);
        setEditingNote(newNote); // Set làm editingNote để có thể auto-save sau này
      }
      // Refresh danh sách notes
      await fetchNotes(view);
      
      // Chỉ đóng editor nếu không phải auto-save
      if (!isAutoSave) {
        setShowNoteEditor(false);
        setEditingNote(null);
        setToast({
          open: true,
          type: "success",
          message: editingNote ? "Đã cập nhật ghi chú" : "Đã tạo ghi chú",
        });
      }
    } catch (error) {
      if (!isAutoSave) {
        setToast({ open: true, type: "error", message: "Lỗi khi lưu ghi chú" });
      }
    }
  };

  const handleTogglePin = async (noteId, currentPinned) => {
    try {
      await notesAPI.updateNote(noteId, { is_pinned: !currentPinned });
      await fetchNotes(view);
    } catch (error) {
      setToast({ open: true, type: "error", message: "Lỗi khi ghim/bỏ ghim" });
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen text-text-primary-light dark:text-text-primary-dark">
      <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        {/* SideNavBar */}
        <aside className="relative flex h-full flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur p-4 border-r border-gray-200 dark:border-gray-800 overflow-visible">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-3 pt-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                ✦
              </div>
              <div>
                <h1 className="text-text-primary-light dark:text-text-primary-dark text-base font-bold leading-tight">
                Ghi Chú Thông Minh
              </h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs">
                Không gian cá nhân của bạn
              </p>
              </div>
            </div>
              {user && (
              <div className="mx-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/15 text-sm text-text-primary-light dark:text-text-primary-dark">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <div>
                    <p className="font-semibold leading-tight">{user.username}</p>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs">
                      Đăng nhập an toàn
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications Panel */}
            <div className="mx-3 mb-2">
              <NotificationsPanel onRefreshNotes={() => fetchNotes(view)} />
            </div>
            
            <div className="flex flex-col gap-1">
              <button
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  view === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary"
                }`}
                onClick={() => {
                  setView("all");
                  setSearchQuery("");
                }}
              >
                <span className="material-symbols-outlined fill">description</span>
                <p className="text-sm font-medium leading-normal">Tất cả ghi chú</p>
              </button>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={handleCreateNote}
              >
                <span className="material-symbols-outlined">add_circle</span>
                <p className="text-sm font-medium leading-normal">Thêm ghi chú mới</p>
              </button>
              <button
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  view === "trash"
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary"
                }`}
                onClick={() => setView("trash")}
              >
                <span className="material-symbols-outlined">delete</span>
                <p className="text-sm font-medium leading-normal">Thùng rác</p>
              </button>
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => navigate("/settings")}
              >
                <span className="material-symbols-outlined">settings</span>
                <p className="text-sm font-medium leading-normal">Cài đặt</p>
              </button>
            </div>
            
            {/* Folder Tree */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <FolderTree
                selectedFolderId={selectedFolderId}
                onSelectFolder={(folderId) => {
                  setSelectedFolderId(folderId);
                  setView("all");
                }}
              />
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors shadow-sm"
              onClick={handleCreateNote}
            >
              <span className="truncate">Tạo ghi chú mới</span>
            </button>
            <button
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:brightness-105 transition"
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
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="mx-auto max-w-6xl flex flex-col gap-6">
            {/* Top bar */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Trang tổng quan
                  </p>
                  <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    {view === "trash" ? "Thùng rác" : "Ghi chú của bạn"}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center gap-3 bg-card-light dark:bg-card-dark rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 shadow-sm">
                    <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">
                      filter_alt
                    </span>
                    <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      <span className="text-text-primary-light dark:text-text-primary-dark font-medium">Sắp xếp</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent text-sm text-text-primary-light dark:text-text-primary-dark focus:outline-none"
                      >
                        <option value="recent">Mới cập nhật</option>
                        <option value="title">Tiêu đề (A-Z)</option>
                      </select>
                    </div>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                    <label className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={hasImageOnly}
                        onChange={(e) => setHasImageOnly(e.target.checked)}
                      />
                      Có ảnh
                    </label>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                    <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      <span className="text-text-primary-light dark:text-text-primary-dark font-medium">Ghim</span>
                      <select
                        value={pinFilter}
                        onChange={(e) => setPinFilter(e.target.value)}
                        className="bg-transparent text-sm text-text-primary-light dark:text-text-primary-dark focus:outline-none"
                      >
                        <option value="all">Tất cả</option>
                        <option value="pinned">Chỉ ghim</option>
                        <option value="unpinned">Không ghim</option>
                      </select>
                    </div>
                  </div>
                  <button
                    className="flex items-center justify-center gap-2 rounded-full bg-primary text-white px-4 h-11 font-semibold shadow-sm hover:bg-primary/90 transition"
                    onClick={handleCreateNote}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Tạo ghi chú
                  </button>
                </div>
              </div>

              {/* Search + stats */}
            <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
              <label className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-full h-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 shadow-sm px-2">
                    <div className="text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-center pl-2 pr-1">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                      className="flex w-full min-w-0 flex-1 rounded-full text-text-primary-light dark:text-text-primary-dark focus:outline-0 focus:ring-2 focus:ring-primary/40 border-none bg-transparent h-full placeholder:text-text-secondary-light placeholder:dark:text-text-secondary-dark px-3 text-base"
                      placeholder="Tìm kiếm tiêu đề hoặc nội dung..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchLoading && (
                    <div className="flex items-center pr-3 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      Đang tìm...
                    </div>
                  )}
                </div>
              </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-primary/90 to-primary text-white px-4 py-3 shadow-sm">
                    <p className="text-xs opacity-90">Tổng ghi chú</p>
                    <p className="text-xl font-bold">{notes.length}</p>
                    <p className="text-xs opacity-80 mt-1">({filteredNotes.length} kết quả lọc)</p>
                  </div>
                  <div className="rounded-lg bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Chế độ</p>
                    <p className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mt-1">
                      {view === "trash" ? "Thùng rác" : "Đang xem tất cả"}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      Cập nhật tự động khi thay đổi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-800 bg-card-light/60 dark:bg-card-dark/60 h-32"
                  />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-card-light/50 dark:bg-card-dark/60">
                <span className="material-symbols-outlined text-6xl text-text-secondary-light dark:text-text-secondary-dark">
                  note_add
                </span>
                <div className="text-center space-y-1">
                  <p className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {view === "trash" ? "Thùng rác trống" : "Chưa có ghi chú phù hợp"}
                  </p>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  {view === "trash"
                      ? "Không có ghi chú trong thùng rác."
                    : searchQuery
                      ? "Thử tìm bằng từ khóa khác hoặc xóa bộ lọc."
                      : "Tạo ghi chú đầu tiên của bạn để bắt đầu."}
                </p>
                </div>
                {view !== "trash" && (
                  <button
                    className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                    onClick={handleCreateNote}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Tạo ghi chú mới
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="w-full @container">
                    <div
                      className="relative flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md p-4 bg-card-light dark:bg-card-dark"
                      style={{ backgroundColor: note.color || undefined }}
                    >
                      {note.is_pinned && (
                        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold shadow-sm">
                          <span className="material-symbols-outlined text-sm">push_pin</span>
                          Quan trọng
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>{formatDateDisplay(note.updated_at)}</span>
                        {note.reminder_at && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-1 border border-amber-100">
                            <span className="material-symbols-outlined text-sm">notifications</span>
                            {formatDateDisplay(note.reminder_at)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                      <div className="h-20 w-20 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white/60 dark:bg-gray-800/60 flex items-center justify-center">
                        {note.image_url ? (
                          <img
                            src={buildFileUrl(note.image_url)}
                            alt="Ảnh ghi chú"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span 
                          className="text-text-secondary-light dark:text-text-secondary-dark text-sm"
                          style={{ display: note.image_url ? 'none' : 'flex' }}
                        >
                          {note.image_url ? 'Lỗi tải ảnh' : 'Không ảnh'}
                        </span>
                      </div>

                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <p className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-[-0.015em] line-clamp-1">
                          {note.title}
                        </p>
                          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-normal line-clamp-3">
                          {note.content || "Không có nội dung"}
                        </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                            {note.image_url ? "Có ảnh" : "Văn bản"}
                          </span>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.tags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark"
                                >
                                  #{tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      {view === "trash" ? (
                          <div className="flex gap-2">
                          <button
                              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg h-9 px-3 bg-primary text-white text-sm font-medium leading-normal hover:bg-primary/90 transition-colors"
                            onClick={() => handleRestoreNote(note.id)}
                          >
                              <span className="material-symbols-outlined text-sm">restore_from_trash</span>
                              Khôi phục
                          </button>
                          <button
                              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg h-9 px-3 bg-red-500 text-white text-sm font-medium leading-normal hover:bg-red-600 transition-colors"
                            onClick={() => confirmDelete(note.id)}
                          >
                              <span className="material-symbols-outlined text-sm">delete_forever</span>
                              Xóa
                          </button>
                        </div>
                      ) : (
                          <div className="flex gap-2">
                            <button
                              className={`flex cursor-pointer items-center justify-center gap-1 rounded-lg h-9 px-3 text-sm font-medium leading-normal transition-colors border ${
                                note.is_pinned
                                  ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                                  : "bg-white text-text-primary-light dark:text-text-primary-dark border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }`}
                              onClick={() => handleTogglePin(note.id, note.is_pinned)}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {note.is_pinned ? "push_pin" : "pin_drop"}
                              </span>
                              {note.is_pinned ? "Bỏ ghim" : "Ghim"}
                            </button>
                          <button
                              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg h-9 px-3 bg-primary text-white text-sm font-medium leading-normal hover:bg-primary/90 transition-colors"
                            onClick={() => handleViewNote(note.id)}
                          >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              Sửa
                          </button>
                          {note.user_id === user?.id && (
                            <button
                              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg h-9 px-3 bg-green-500 text-white text-sm font-medium leading-normal hover:bg-green-600 transition-colors"
                              onClick={() => setShareModal({ open: true, note })}
                            >
                              <span className="material-symbols-outlined text-sm">share</span>
                              Share
                            </button>
                          )}
                          <button
                              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg h-9 px-3 bg-red-500 text-white text-sm font-medium leading-normal hover:bg-red-600 transition-colors"
                            onClick={() => confirmDelete(note.id)}
                          >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              Xóa
                          </button>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Note Editor Modal */}
      {showNoteEditor && (
        <NoteEditor
          note={editingNote}
          selectedFolderId={selectedFolderId}
          onSave={handleSaveNote}
          onClose={() => {
            setShowNoteEditor(false);
            setEditingNote(null);
          }}
          onUploadImage={notesAPI.uploadImage}
          availableTags={tags}
          onCreateTag={handleCreateTag}
        />
      )}

      {/* Share Note Modal */}
      {shareModal.open && shareModal.note && (
        <ShareNoteModal
          note={shareModal.note}
          onClose={() => setShareModal({ open: false, note: null })}
          onSuccess={() => {
            setToast({ open: true, type: "success", message: "Đã gửi share request thành công" });
          }}
        />
      )}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl bg-card-light dark:bg-card-dark shadow-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                  {confirmModal.mode === "delete" ? "Xóa vĩnh viễn?" : "Chuyển vào thùng rác?"}
                </p>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {confirmModal.mode === "delete"
                    ? "Thao tác này không thể hoàn tác."
                    : "Bạn có thể khôi phục trong Thùng rác."}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setConfirmModal({ open: false, noteId: null, mode: "trash" })}
              >
                Hủy
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmModal.mode === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                }`}
                onClick={handleDeleteNote}
              >
                {confirmModal.mode === "delete" ? "Xóa vĩnh viễn" : "Chuyển vào thùng rác"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast.open && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`min-w-[260px] max-w-sm rounded-lg px-4 py-3 shadow-xl border text-sm font-medium flex items-start gap-3 ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                toast.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {toast.type === "success" ? "check_circle" : "error"}
              </span>
            </div>
            <div className="flex-1 leading-snug">{toast.message}</div>
            <button
              className="text-text-secondary-light hover:text-text-primary-light"
              onClick={() => setToast({ ...toast, open: false })}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

