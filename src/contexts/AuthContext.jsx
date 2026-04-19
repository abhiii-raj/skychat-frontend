import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { usersAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = 'sky_token';
const USER_KEY = 'sky_user';

const readStoredUser = () => {
  try {
    const serialized = localStorage.getItem(USER_KEY);
    return serialized ? JSON.parse(serialized) : null;
  } catch {
    return null;
  }
};

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [token]);

  const persistSession = (nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser || null));
    setToken(nextToken);
    setUser(nextUser || null);
  };

  const login = (nextToken, nextUser = null) => {
    persistSession(nextToken, nextUser);
  };

  const handleLogin = async (username, password) => {
    const { data } = await api.post('/login', { username, password });
    persistSession(data.token, data.user || { username, name: username });
    return data;
  };

  const handleRegister = async (name, username, password) => {
    const { data } = await api.post('/register', { name, username, password });
    return data;
  };

  const refreshProfile = async () => {
    const { data } = await usersAPI.getProfile();
    setUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  };

  const updateProfile = async ({ name, bio, avatarFile }) => {
    const currentToken = localStorage.getItem(TOKEN_KEY) || '';

    if (currentToken.startsWith('google-')) {
      const updatedUser = {
        ...(user || {}),
        name: (name || user?.name || '').trim(),
        bio: (bio || '').trim(),
      };

      if (avatarFile) {
        updatedUser.avatarUrl = await fileToDataUrl(avatarFile);
      }

      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }

    const formData = new FormData();
    formData.append('name', name || '');
    formData.append('bio', bio || '');
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const { data } = await usersAPI.updateProfile(formData);
    setUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  };

  const addToUserHistory = async (meetingCode) => {
    const currentToken = localStorage.getItem(TOKEN_KEY);

    if (!currentToken) {
      throw new Error('Missing auth token');
    }

    return api.post('/add_to_activity', {
      token: currentToken,
      meeting_code: meetingCode,
    });
  };

  const getHistoryOfUser = async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    const { data } = await api.get('/get_all_activity', {
      params: { token: currentToken },
    });

    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        handleLogin,
        handleRegister,
        refreshProfile,
        updateProfile,
        addToUserHistory,
        getHistoryOfUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};