import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../config';

/**
 * Shared Google OAuth hook.
 * @param onSuccess Optional callback (can be async) called after successful login.
 */
export function useGoogleAuth(onSuccess?: () => void | Promise<void>) {
  const { setAuth, setLoading } = useAuthStore();

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      setLoading(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        const res = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.access_token, user_info: userInfo }),
        });
        if (!res.ok) throw new Error('Login failed');

        const data = await res.json();
        setAuth(data.user, data.token);
        onSuccess?.();
      } catch (err) {
        console.error('Login error:', err);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
    },
  });

  return login;
}
