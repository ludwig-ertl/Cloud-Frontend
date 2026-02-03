<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: any
  loading?: boolean
  disabled?: boolean
  to?: string
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false
})
</script>

<template>
  <component
      :is="to ? 'NuxtLink' : 'button'"
      :to="to"
      class="app-button"
      :class="[variant, size, { loading, block }]"
      :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner"></span>
    
    <div class="content" :class="{ invisible: loading }">
      <component v-if="icon" :is="icon" :size="size === 'sm' ? 16 : 20" />
      <slot />
    </div>
  </component>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-m);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.app-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.2);
}

.content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
}

.invisible {
  opacity: 0;
}


.sm {
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
  border-radius: var(--radius-s);
}

.md {
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
}

.lg {
  height: 60px;
  padding: 0 32px;
  font-size: 18px;
  border-radius: var(--radius-l);
}

.block {
  display: flex;
  width: 100%;
}


.primary {
  background: var(--primary);
  color: var(--text-inverted);
}

.primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 0 12px rgba(184, 20, 28, 0.25);
}

.primary:active:not(:disabled) {
  transform: translateY(0);
}

.secondary {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.08);
}

.secondary:hover:not(:disabled) {
  background: var(--surface-hover);
  background: var(--surface-hover);
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.1);
}

.ghost {
  background: transparent;
  color: var(--text-muted);
}

.ghost:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text);
  transform: translateY(-1px);
}

.ghost:active:not(:disabled) {
  transform: translateY(0);
}

.danger {
  background: var(--primary);
  color: var(--text-inverted);
}

.danger:hover:not(:disabled) {
  filter: brightness(0.9);
  box-shadow: 0 0 12px rgba(184, 20, 28, 0.25);
  transform: translateY(-1px);
}

.danger:active:not(:disabled) {
  transform: translateY(0);
}


.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  position: absolute;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>