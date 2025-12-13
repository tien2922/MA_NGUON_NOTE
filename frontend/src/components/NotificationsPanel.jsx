import { useState, useEffect } from "react";
import { shareAPI } from "../services/api";

export default function NotificationsPanel({ onRefreshNotes }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await shareAPI.getPendingShares();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh mỗi 30 giây
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (shareId) => {
    try {
      await shareAPI.acceptShare(shareId);
      await fetchNotifications();
      if (onRefreshNotes) onRefreshNotes();
    } catch (error) {
      console.error("Error accepting share:", error);
      alert(error.message || "Có lỗi xảy ra khi chấp nhận");
    }
  };

  const handleReject = async (shareId) => {
    try {
      await shareAPI.rejectShare(shareId);
      await fetchNotifications();
    } catch (error) {
      console.error("Error rejecting share:", error);
      alert(error.message || "Có lỗi xảy ra khi từ chối");
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-text-secondary-light dark:text-text-secondary-dark w-full"
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-4.5 flex items-center justify-center px-1 border border-white dark:border-gray-800">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="text-sm font-medium">Thông báo</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-0 lg:left-[260px] top-16 lg:top-4 ml-4 lg:ml-2 mr-4 lg:mr-0 w-[calc(100vw-2rem)] lg:w-80 xl:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[101] max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">notifications</span>
                  <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                    Thông báo
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    <span>Đang tải...</span>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-text-secondary-light dark:text-text-secondary-dark mb-2 block">notifications_off</span>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">Không có thông báo mới</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center ring-2 ring-primary/20 dark:ring-primary/30">
                          <span className="material-symbols-outlined text-primary text-xl">
                            share
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary-light dark:text-text-primary-dark leading-relaxed mb-3">
                            <span className="font-bold text-primary">{notif.shared_by_username}</span> đã share ghi chú{" "}
                            <span className="font-semibold text-primary/80">"{notif.note_title}"</span> với bạn
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(notif.id)}
                              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-base">check</span>
                              Chấp nhận
                            </button>
                            <button
                              onClick={() => handleReject(notif.id)}
                              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                              Từ chối
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

