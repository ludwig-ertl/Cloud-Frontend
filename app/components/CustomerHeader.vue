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
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  padding: 10px;
  transition: transform 0.1s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  transform: scale(1.1);
}
</style>
