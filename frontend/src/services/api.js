// API base URL - có thể thay đổi khi deploy
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper build absolute URL for file paths returned by backend (e.g. /uploads/xxx.png)
export const buildFileUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_URL}${path}`;
};

// Helper function để lấy token từ localStorage
const getToken = () => {
  return localStorage.getItem('access_token');
};

// Helper function để set token vào localStorage
const setToken = (token) => {
  localStorage.setItem('access_token', token);
};

// Helper function để remove token
const removeToken = () => {
  localStorage.removeItem('access_token');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Có lỗi xảy ra' }));
    throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Nếu response là 204 No Content, không parse JSON
  if (response.status === 204) {
    return null;
  }

  // Kiểm tra xem response có body không
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  return null;
};

// Notes API
export const notesAPI = {
  // Lấy danh sách notes
  getNotes: async (folderId = null) => {
    const url = folderId ? `/notes?folder_id=${folderId}` : '/notes';
    return apiRequest(url);
  },

  // Lấy thùng rác
  getTrash: async () => {
    return apiRequest('/notes/trash');
  },

  // Lấy chi tiết note
  getNote: async (noteId) => {
    return apiRequest(`/notes/${noteId}`);
  },

  // Tạo note mới
  createNote: async (noteData) => {
    return apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  // Cập nhật note
  updateNote: async (noteId, noteData) => {
    return apiRequest(`/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(noteData),
    });
  },

  // Xóa note
  deleteNote: async (noteId) => {
    const result = await apiRequest(`/notes/${noteId}`, {
      method: 'DELETE',
    });
    return result; // Có thể là null nếu 204
  },

  // Khôi phục note từ thùng rác
  restoreNote: async (noteId) => {
    return apiRequest(`/notes/${noteId}/restore`, {
      method: 'POST',
    });
  },

  // Xóa vĩnh viễn note trong thùng rác
  forceDeleteNote: async (noteId) => {
    return apiRequest(`/notes/${noteId}/force`, {
      method: 'DELETE',
    });
  },

  // Upload ảnh cho ghi chú
  uploadImage: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/notes/upload`, {
      method: 'POST',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Có lỗi khi upload ảnh' }));
      throw new Error(error.detail || 'Có lỗi khi upload ảnh');
    }

    return response.json();
  },
};

// Auth API
export const authAPI = {
  // Đăng ký
  register: async (username, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  // Đăng nhập
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2PasswordRequestForm dùng 'username'
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Email hoặc mật khẩu không đúng' }));
      throw new Error(error.detail || 'Email hoặc mật khẩu không đúng');
    }

    const data = await response.json();
    setToken(data.access_token);
    return data;
  },

  // Đăng xuất
  logout: () => {
    removeToken();
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!getToken();
  },

  // Lấy token
  getToken,

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

export default apiRequest;

