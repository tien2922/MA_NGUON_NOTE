import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { notesAPI } from "../services/api";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/dangnhap");
      return;
    }
    fetchNotes();
  }, [isAuthenticated, navigate]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await notesAPI.getNotes();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      // Nếu lỗi 401, đăng xuất và chuyển về trang đăng nhập
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        logout();
        navigate("/dangnhap");
      }
    } finally {
      setLoading(false);
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

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = () => {
    // TODO: Navigate to create note page
    console.log("Create note");
  };

  const handleViewNote = (noteId) => {
    // TODO: Navigate to note detail page
    console.log("View note:", noteId);
  };

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
            </div>
            <div className="flex flex-col gap-1">
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchQuery("");
                }}
              >
                <span className="material-symbols-outlined fill">description</span>
                <p className="text-sm font-medium leading-normal">Tất cả ghi chú</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary transition-colors"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleCreateNote();
                }}
              >
                <span className="material-symbols-outlined">add_circle</span>
                <p className="text-sm font-medium leading-normal">Thêm ghi chú mới</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary transition-colors"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Navigate to trash
                }}
              >
                <span className="material-symbols-outlined">delete</span>
                <p className="text-sm font-medium leading-normal">Thùng rác</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary transition-colors"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Navigate to settings
                }}
              >
                <span className="material-symbols-outlined">settings</span>
                <p className="text-sm font-medium leading-normal">Cài đặt</p>
              </a>
            </div>
          </div>
          <div className="mt-auto">
            <button
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
              onClick={handleCreateNote}
            >
              <span className="truncate">Tạo ghi chú mới</span>
            </button>
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
            {/* SearchBar */}
            <div className="mb-6">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-text-secondary-light dark:text-text-secondary-dark flex border-none bg-input-light dark:bg-input-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-primary-light dark:text-text-primary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-input-light dark:bg-input-dark h-full placeholder:text-text-secondary-light placeholder:dark:text-text-secondary-dark px-4 pl-2 text-base font-normal leading-normal"
                    placeholder="Tìm kiếm ghi chú của bạn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* SectionHeader */}
            <h2 className="text-text-primary-light dark:text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Ghi chú gần đây
            </h2>

            {/* Cards Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-text-secondary-light dark:text-text-secondary-dark">Đang tải...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <span className="material-symbols-outlined text-6xl text-text-secondary-light dark:text-text-secondary-dark">
                  note_add
                </span>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg">
                  {searchQuery ? "Không tìm thấy ghi chú nào" : "Chưa có ghi chú nào. Tạo ghi chú đầu tiên của bạn!"}
                </p>
                {!searchQuery && (
                  <button
                    className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                    onClick={handleCreateNote}
                  >
                    <span className="truncate">Tạo ghi chú mới</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="w-full @container">
                    <div className="flex flex-col items-stretch justify-start rounded-lg bg-card-light dark:bg-card-dark shadow-sm transition-shadow hover:shadow-md @xl:flex-row @xl:items-start p-4">
                      <div className="flex w-full min-w-0 grow flex-col items-stretch justify-center gap-2">
                        <p className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-[-0.015em]">
                          {note.title}
                        </p>
                        <div className="flex items-end gap-3 justify-between">
                          <div className="flex flex-col gap-1">
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal line-clamp-2">
                              {note.content || "Không có nội dung"}
                            </p>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
                              {formatTimeAgo(note.updated_at)}
                            </p>
                          </div>
                          <button
                            className="flex shrink-0 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-primary text-white text-sm font-medium leading-normal hover:bg-primary/90 transition-colors"
                            onClick={() => handleViewNote(note.id)}
                          >
                            <span className="truncate">Xem</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

