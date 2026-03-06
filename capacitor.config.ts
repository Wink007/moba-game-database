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
      appId: 'ca-app-pub-9322014090918199~5496386441',
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '298925088925-a5l28snnss99vm5hskqnh644nopu85pl.apps.googleusercontent.com',
      forceCodeForRefreshToken: false,
    },
  },
};

export default config;
