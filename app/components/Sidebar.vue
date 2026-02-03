<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from '#imports'
import {
  FileText,
  Terminal,
  FileClock,
  Settings,
  Building2,
  Users,
  UserPlus,
  LogOut,
  ArrowLeft
} from 'lucide-vue-next'

const route = useRoute()
const { logout } = useAuth()
const { $api } = useNuxtApp()

const showUserActions = ref(false)
const manageUsers = ref(false)

const newUser = ref('')
const newPassword = ref('')
const userMessage = ref<string | null>(null)
const userError = ref<string | null>(null)

const navItems = [
  { to: '/configurator', label: 'Konfigurator', icon: FileText },
  { to: '/logs', label: 'Logs', icon: FileClock },
  { to: '/shell', label: 'Shell', icon: Terminal },
  { to: '/settings', label: 'Einstellungen', icon: Settings }
]

const closeActions = () => {
  showUserActions.value = false
  manageUsers.value = false
}

const addUser = async () => {
  if (!newUser.value || !newPassword.value) return

  userError.value = null
  userMessage.value = null

  try {
    await $api('/crud/user/', {
      method: 'POST',
      body: {
        username: newUser.value,
        pwd: newPassword.value,
        role: 'admin',
        auth_source: 'cloudflare',
        disabled: 'false'
      }
    })

    userMessage.value = `Benutzer „${newUser.value}“ erstellt`
    newUser.value = ''
    newPassword.value = ''

    setTimeout(() => (userMessage.value = null), 2500)
  } catch (e: any) {
    userError.value =
        e?.data?.detail || 'Benutzer konnte nicht erstellt werden'
  }
}

onMounted(() => {
  window.addEventListener('click', closeActions)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeActions)
})
</script>

<template>
  <nav class="sidenav">
    <div class="stack">
      <div class="logo">
        <img src="/logo.webp" alt="SECOM Logo" />
      </div>

      <ul class="nav">
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink :to="item.to" class="nav-link">
            <div
                class="icon"
                :class="{ active: route.path.startsWith(item.to) }"
            >
              <component :is="item.icon" :size="24" />
            </div>
            <span>{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>

      <div class="footer">
        <div class="footer-item">
          <Building2 :size="20" class="footer-icon" />
          <span>IT-HTL</span>
        </div>

        <div
            class="footer-item clickable"
            :class="{ active: showUserActions }"
            @click.stop="showUserActions = !showUserActions"
        >
          <Users :size="20" class="footer-icon" />
          <span>ludwig.ertl</span>

          <Transition name="scale">
            <div
                v-if="showUserActions"
                class="user-popover"
                @click.stop
            >
              <template v-if="!manageUsers">
                <button
                    class="popover-item"
                    @click="manageUsers = true"
                >
                  <UserPlus :size="16" />
                  Benutzer verwalten
                </button>

                <button
                    class="popover-item danger"
                    @click="logout"
                >
                  <LogOut :size="16" />
                  Abmelden
                </button>
              </template>

              <template v-else>
                <button
                    class="popover-item"
                    @click="manageUsers = false"
                >
                  <ArrowLeft :size="16" />
                  Zurück
                </button>

                <div class="user-form">
                  <AppInput
                      v-model="newUser"
                      placeholder="Benutzername"
                      class="mini-input"
                  />
                  <AppInput
                      v-model="newPassword"
                      type="password"
                      placeholder="Passwort"
                      class="mini-input"
                  />

                  <AppButton
                      size="sm"
                      variant="danger"
                      block
                      :disabled="!newUser || !newPassword"
                      @click="addUser"
                  >
                    Hinzufügen
                  </AppButton>
                </div>

                <div v-if="userError" class="user-error">
                  {{ userError }}
                </div>

                <div v-if="userMessage" class="user-message">
                  {{ userMessage }}
                </div>
              </template>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.sidenav {
  width: 240px;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  position: relative;
  z-index: 10;
}

.stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  height: 90vh;
}

.logo img {
  height: 24px;
  opacity: 0.9;
}

.nav {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-fast);
}

.nav-link:hover .icon:not(.active) {
  background: var(--surface-hover);
  transform: translateY(-2px);
}

.icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-l);
  display: grid;
  place-items: center;
  background: var(--surface);
  color: var(--text-muted);
  box-shadow: 0 0 6px rgba(0,0,0,0.03);
  transition: all var(--transition-normal);
}

.icon.active {
  background: var(--primary);
  color: var(--text-inverted);
  box-shadow: 0 8px 16px rgba(184, 20, 28, 0.25);
  transform: scale(1.05);
}

.footer {
  margin-top: auto;
  font-size: 11px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--text-muted);
}

.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  transition: color var(--transition-fast);
}

.footer-item.clickable {
  cursor: pointer;
}

.footer-item.clickable:hover,
.footer-item.active {
  color: var(--text);
}

.footer-icon {
  color: inherit;
  opacity: 0.7;
}

.user-popover {
  position: absolute;
  left: calc(100% + 16px);
  bottom: 0;
  width: 240px;
  background: var(--surface);
  border-radius: var(--radius-m);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.09);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 20;
  z-index: 20;
}

.popover-item {
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-s);
  font-size: 13px;
  color: var(--text);
  transition: background var(--transition-fast);
}

.popover-item:hover {
  background: var(--background);
}

.popover-item.danger {
  color: var(--error);
}

.popover-item.danger:hover {
  background: #fef2f2;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 4px;
}

.user-message {
  font-size: 12px;
  color: var(--success);
  text-align: center;
}

.user-error {
  font-size: 12px;
  color: var(--error);
  text-align: center;
}


.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translate(-10px, 10px);
}
</style>
