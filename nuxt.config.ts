// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/main.css'],
  runtimeConfig: {
    public: {
      apiBase: '' // Use relative path to go through the proxy
    }
  },
  vite: {
    server: {
      allowedHosts: true,
      hmr: {
        protocol: 'wss',
        clientPort: 443,
      },
      proxy: {
        '/api': {
          target: 'https://127.0.0.1:52970',
          secure: false, // Ignore self-signed certificates
          changeOrigin: true
        }
      }
    }
  },
  routeRules: {
    '/': { redirect: '/login' },
  },
  devtools: { enabled: true }
})
