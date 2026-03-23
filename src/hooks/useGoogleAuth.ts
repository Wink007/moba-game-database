import { useGoogleLogin } from '@react-oauth/google';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../config';

const WEB_CLIENT_ID = '298925088925-a5l28snnss99vm5hskqnh644nopu85pl.apps.googleusercontent.com';

/**
 * Shared Google OAuth hook.
 * - Web: uses @react-oauth/google popup flow
 * - Android/iOS (Capacitor): uses native Google Sign-In via capacitor-google-auth
 * @param onSuccess Optional callback (can be async) called after successful login.
 */
export function useGoogleAuth(onSuccess?: () => void | Promise<void>) {
  const { setAuth, setLoading } = useAuthStore();

  // Native Android/iOS flow
  const loginNative = async () => {
    setLoading(true);
    try {
      await GoogleAuth.initialize({
        clientId: WEB_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: false,
      });
      const googleUser = await GoogleAuth.signIn();
      // On Android, accessToken is empty - use idToken instead
      // When sending idToken, don't send user_info so backend uses id_token verification flow
      const idToken = googleUser.authentication.idToken;
      const accessToken = googleUser.authentication.accessToken;

      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          idToken
            ? { credential: idToken }
            : { credential: accessToken, user_info: {
                sub: googleUser.id,
                name: googleUser.name,
                email: googleUser.email,
                picture: googleUser.imageUrl,
              }}
        ),
      });
      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();
      setAuth(data.user, data.token);
      onSuccess?.();
    } catch (err: any) {
      console.error('Native login error:', err);
      alert('Login error: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  // Web flow
  const loginWeb = useGoogleLogin({
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

  return Capacitor.isNativePlatform() ? loginNative : loginWeb;
}
