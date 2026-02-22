<script setup lang="ts">
import { ref } from 'vue'
import { LogIn, ShieldCheck } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth'
})

const { login } = useAuth()

const email = ref('')
const password = ref('')
const remember = ref(false)
const error = ref<string | null>(null)
const loading = ref(false)

const handleLogin = async () => {
  try {
    error.value = null
    loading.value = true
    await login(email.value, password.value, remember.value)
  } catch (e: any) {
    error.value = e.message || 'Login fehlgeschlagen'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-container animate-slide-up">
      <AppCard class="login-card">
        <template #header>
          <div class="header-content">
            <h1>SecureAccess Admin Login</h1>
            <p class="subtitle">
              Bitte melden Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort an.
            </p>
          </div>
        </template>

        <form @submit.prevent="handleLogin" class="login-form">
          <AppInput
              v-model="email"
              label="E-Mail"
              required
              :disabled="loading"
          />

          <div class="password-group">
            <AppInput
                v-model="password"
                type="password"
                label="Passwort"
                required
                is-password
                :disabled="loading"
            />
          </div>

          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="remember" class="custom-checkbox" />
            <span>Angemeldet bleiben</span>
          </label>

          <Transition name="fade">
            <div v-if="error" class="error-banner">
              {{ error }}
            </div>
          </Transition>

          <div class="actions">
            <AppButton
                type="submit"
                variant="primary"
                size="lg"
                block
                :loading="loading"
                :icon="LogIn"
            >
              Anmelden
            </AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #b00000;
  background: -webkit-linear-gradient(45deg, #b00000 0%, #400000 100%);
  background: linear-gradient(45deg, #b00000 0%, #400000 100%);
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 500px;
}

.login-card {
  border: 1px solid var(--border);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-l);
}

.header-content {
  text-align: left;
  padding-bottom: 0px;

}

.brand-icon {
  color: var(--primary);
  margin-bottom: 16px;
  display: inline-flex;
  padding: 12px;
  background: var(--primary-light);
  border-radius: 50%;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text);
}

.subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
  text-align: left;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.password-group {
  margin-bottom: 8px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: var(--text);
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
  cursor: pointer;
}

.error-banner {
  background: #fef2f2;
  color: var(--error);
  padding: 12px;
  border-radius: var(--radius-s);
  font-size: 14px;
  text-align: center;
  border: 1px solid #fee2e2;
}

.actions {
  margin-top: 8px;
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.label) {
  font-size: 13px !important;
}

:deep(.primary:hover) {
  transform: none !important;
}
</style>
