import { ref, computed } from 'vue';
import type { User } from '../types';

const TOKEN_KEY = 'questboy_jwt';
const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
const user = ref<User | null>(null);
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value);

  const setAuthData = (newToken: string, userData: User) => {
    token.value = newToken;
    user.value = userData;
    localStorage.setItem(TOKEN_KEY, newToken);
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
  };

  const getAuthHeader = (): Record<string, string> => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {};
  };

  const login = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal masuk');
      }
      setAuthData(data.token, data.user);
      return data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (name: string, email: string, password: string, avatar: string = 'boy_cap') => {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, avatar }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal daftar');
      }
      setAuthData(data.token, data.user);
      return data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchProfile = async () => {
    if (!token.value) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeader(),
      });
      if (res.status === 401) {
        clearAuth();
        return null;
      }
      const data = await res.json();
      if (data.success && data.user) {
        user.value = data.user;
        return data.user;
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
    return null;
  };

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout: clearAuth,
    fetchProfile,
    getAuthHeader,
  };
}
