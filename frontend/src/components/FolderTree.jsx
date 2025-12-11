import { useState, useEffect } from "react";
import { foldersAPI } from "../services/api";

export default function FolderTree({ selectedFolderId, onSelectFolder, onCreateFolder }) {
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const data = await foldersAPI.getFolders();
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await foldersAPI.createFolder({ name: newFolderName.trim(), parent_id: null });
      setNewFolderName("");
      setShowCreateInput(false);
      await fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Không thể tạo thư mục: " + (error.message || "Lỗi không xác định"));
    }
  };

  const handleDeleteFolder = async (folderId, e) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc muốn xóa thư mục này? Các ghi chú trong thư mục sẽ không bị xóa.")) {
      return;
    }

    try {
      await foldersAPI.deleteFolder(folderId);
      await fetchFolders();
      if (selectedFolderId === folderId) {
        onSelectFolder(null);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Không thể xóa thư mục: " + (error.message || "Lỗi không xác định"));
    }
  };

  const buildFolderTree = (folders, parentId = null) => {
    return folders
      .filter((f) => f.parent_id === parentId)
      .map((folder) => ({
        ...folder,
        children: buildFolderTree(folders, folder.id),
      }));
  };

  const renderFolder = (folder, level = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group ${
            isSelected
              ? "bg-primary text-white"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary"
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            onSelectFolder(folder.id);
            if (hasChildren) {
              toggleFolder(folder.id);
            }
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.id);
            }}
            className={`${hasChildren ? "" : "invisible"} text-sm`}
          >
            <span className="material-symbols-outlined text-sm">
              {isExpanded ? "expand_more" : "chevron_right"}
            </span>
          </button>
          <span className="material-symbols-outlined text-sm">
            {isExpanded && hasChildren ? "folder_open" : "folder"}
          </span>
          <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>
          <button
            onClick={(e) => handleDeleteFolder(folder.id, e)}
            className="opacity-0 group-hover:opacity-100 text-sm hover:text-red-500 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div>{folder.children.map((child) => renderFolder(child, level + 1))}</div>
        )}
      </div>
    );
  };

  const folderTree = buildFolderTree(folders);

  if (loading) {
    return (
      <div className="text-text-secondary-light dark:text-text-secondary-dark text-sm py-4">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          Thư mục
        </h3>
        <button
          onClick={() => setShowCreateInput(!showCreateInput)}
          className="text-primary hover:bg-primary/10 rounded p-1 transition-colors"
          title="Tạo thư mục mới"
        >
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>

      {showCreateInput && (
        <form onSubmit={handleCreateFolder} className="px-3 mb-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Tên thư mục..."
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            onBlur={() => {
              if (!newFolderName.trim()) {
                setShowCreateInput(false);
              }
            }}
          />
        </form>
      )}

      <div className="space-y-1">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            selectedFolderId === null
              ? "bg-primary text-white"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-sm">home</span>
          <span className="text-sm font-medium">Tất cả</span>
        </button>

        {folderTree.length === 0 ? (
          <div className="px-3 py-4 text-center text-text-secondary-light dark:text-text-secondary-dark text-xs">
            Chưa có thư mục nào
          </div>
        ) : (
          folderTree.map((folder) => renderFolder(folder))
        )}
      </div>
    </div>
  );
}

