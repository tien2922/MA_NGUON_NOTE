import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem đã đăng nhập chưa khi component mount
    const token = authAPI.getToken();
    if (token) {
      // Lấy thông tin user từ API
      authAPI.getCurrentUser()
        .then(userData => {
          setUser({ token, ...userData });
        })
        .catch(() => {
          // Nếu lỗi, xóa token và đăng xuất
          authAPI.logout();
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      // Lấy thông tin user sau khi đăng nhập
      const userData = await authAPI.getCurrentUser();
      setUser({ token: data.access_token, ...userData });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      await authAPI.register(username, email, password);
      // Sau khi đăng ký thành công, tự động đăng nhập
      return await login(email, password);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    navigate('/dangnhap');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

