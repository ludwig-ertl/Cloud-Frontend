<template>
  <div class="app-card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    
    <div
        class="card-content"
        :class="{ 'no-padding': noPadding, 'flex-grow': fullHeight }"
    >
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  noPadding?: boolean
  fullHeight?: boolean
}>()
</script>

<style scoped>
.app-card {
  background: var(--surface);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-m);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-card.full-height {
  height: 100%;
}

.card-header {
  padding: 24px 32px;
  padding: 24px 32px;
}

.card-content {
  padding: 15px 32px 32px 32px;
}

.card-content.no-padding {
  padding: 0;
}

.card-content.flex-grow {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-footer {
  padding: 24px 32px;
  background: var(--background);
  background: var(--background);
}

@media (max-width: 600px) {
  .card-content {
    padding: 24px;
  }
}
</style>
