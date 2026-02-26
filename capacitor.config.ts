import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mobawiki.mlbb',
  appName: 'MOBA Wiki',
  webDir: 'build',
  android: {
    allowMixedContent: true,
    backgroundColor: '#0f172a',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      autoHide: false,
      backgroundColor: '#0f172a',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
    AdMob: {
      // Замінити на реальний App ID з AdMob консолі після реєстрації
      // Тест App ID (Google офіційний тест):
      appId: 'ca-app-pub-3940256099942544~3347511713',
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '298925088925-a5l28snnss99vm5hskqnh644nopu85pl.apps.googleusercontent.com',
      forceCodeForRefreshToken: false,
    },
  },
};

export default config;
