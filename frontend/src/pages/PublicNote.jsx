import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { shareAPI, buildFileUrl } from "../services/api";

export default function PublicNote() {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await shareAPI.getPublicNote(token);
        setNote(data);
      } catch (err) {
        setError(err.message || "Không tải được ghi chú");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
        <p>Đang tải ghi chú...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
        <div className="text-center space-y-3">
          <p className="text-xl font-semibold">Không thể xem ghi chú</p>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">{error}</p>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-white font-semibold hover:bg-primary/90"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{note.title}</h1>
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 px-4 text-sm hover:bg-primary/10"
          >
            Về trang chủ
          </Link>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark text-xs"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {note.image_url && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <img
              src={buildFileUrl(note.image_url)}
              alt="Ảnh ghi chú"
              className="w-full object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        )}

        <div className="prose max-w-none dark:prose-invert bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content || "_(Trống)_"}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

