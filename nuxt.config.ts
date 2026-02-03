// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/main.css'],
  runtimeConfig: {
    public: {
      apiBase: 'http://127.0.0.1:8000'
    }
  },
  devtools: { enabled: true }
})
