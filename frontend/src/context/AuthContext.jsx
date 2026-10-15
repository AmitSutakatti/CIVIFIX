import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/user/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Only fetch user if we don't already have one (to avoid unnecessary API call after login)
      if (!user) {
        fetchUser();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data?.user || response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      // Backend returns: { success: true, data: { user, token } }
      const { user, token } = response.data.data;
      // Set token and user synchronously
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setLoading(false); // Ensure loading is false
      // Return success with user data
      return { success: true, user };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      // Backend returns: { success: true, data: { user, token } }
      if (response.data.success && response.data.data) {
        const { user, token, registrationBonus } = response.data.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        setLoading(false);
        return {
          success: true,
          user,
          registrationBonus,
          message: response.data.message,
        };
      } else {
        setLoading(false);
        return {
          success: false,
          message: response.data.message || 'Registration failed',
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    fetchUser,
    isAuthenticated: !!user || !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

