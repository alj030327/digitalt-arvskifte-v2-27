import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c410ed21f8e34f9c89e1ddb889afdccd',
  appName: 'arvs-fl',
  webDir: 'dist',
  server: {
    url: 'https://c410ed21-f8e3-4f9c-89e1-ddb889afdccd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;