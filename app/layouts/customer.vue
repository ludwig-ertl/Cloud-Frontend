<script setup lang="ts">
import CustomerHeader from '~/components/CustomerHeader.vue'
</script>

<template>
  <div class="customer-layout">
    <CustomerHeader />
    <main class="customer-main">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.customer-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background);
  overflow: hidden;
}

.customer-main {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}
</style>
