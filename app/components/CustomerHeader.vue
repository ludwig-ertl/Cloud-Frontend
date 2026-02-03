<script setup lang="ts">
import { LogOut, User } from 'lucide-vue-next'

const { logout } = useAuth()
</script>

<template>
  <header class="customer-header">
    <div class="logo">
      <img src="/logo.webp" alt="SECOM" class="logo-image" />
    </div>

    <div class="actions">
      <button class="icon-btn">
        <User :size="20" />
      </button>
      <button class="icon-btn" @click="logout">
        <LogOut :size="20" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  background: var(--surface);
}

.logo-image {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.actions {
  display: flex;
  gap: 16px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--background);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text);
}

.icon-btn:hover {
  background: var(--surface-hover);
  color: var(--primary);
}
</style>
