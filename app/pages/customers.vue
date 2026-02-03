<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { Search, ArrowLeft, ArrowRight, LayoutGrid, GalleryHorizontal } from 'lucide-vue-next'

definePageMeta({
  layout: 'customer'
})

const isSmallView = ref(false)
const customers = ref(Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Kunde ${i + 1}` }))) // Generate detailed list for demo

// Drag to Scroll Logic
const scrollContainer = ref<HTMLElement | null>(null)
const isDown = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)
const isDragging = ref(false)

const startDrag = (e: MouseEvent) => {
  if (!scrollContainer.value) return
  isDown.value = true
  isDragging.value = false
  startX.value = e.pageX - scrollContainer.value.offsetLeft
  scrollLeft.value = scrollContainer.value.scrollLeft
}

const stopDrag = () => {
  isDown.value = false
  setTimeout(() => isDragging.value = false, 50) // Small delay to prevent click triggering after drag
}

const moveDrag = (e: MouseEvent) => {
  if (!isDown.value || !scrollContainer.value) return
  e.preventDefault()
  const x = e.pageX - scrollContainer.value.offsetLeft
  const walk = (x - startX.value) * 2 // Scroll-fastness
  scrollContainer.value.scrollLeft = scrollLeft.value - walk
  if (Math.abs(walk) > 5) isDragging.value = true
}


const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const handleScroll = () => {
  if (!scrollContainer.value) return
  const { scrollLeft: sl, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = sl > 0
  // Tolerance of 1px for float calculations
  canScrollRight.value = sl + clientWidth < scrollWidth - 1
}

const searchQuery = ref('')
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value
  const query = searchQuery.value.toLowerCase()
  return customers.value.filter(c => c.name.toLowerCase().includes(query))
})

const selectedIndex = ref(0)
const highlightLeft = ref(false)
const highlightRight = ref(false)

const scrollToIndex = (index: number) => {
  if (!scrollContainer.value) return
  const cardWidth = 280 // width of card wrapper
  const gap = 60 // gap between cards
  const containerWidth = scrollContainer.value.clientWidth
  
  // Calculate position to center the card
  // (cardWidth * index) + (gap * index) is the left position relative to start
  // We want to center it, so we subtract half the container width and add half the card width
  const cardLeft = index * (cardWidth + gap)
  const centerPos = cardLeft - (containerWidth / 2) + (cardWidth / 2) + 40 // +40 for initial padding
  
  scrollContainer.value.scrollTo({
    left: centerPos,
    behavior: 'smooth'
  })
}

const triggerAnim = (side: 'left' | 'right') => {
  if (side === 'left') {
    highlightLeft.value = true
    setTimeout(() => highlightLeft.value = false, 150)
  } else {
    highlightRight.value = true
    setTimeout(() => highlightRight.value = false, 150)
  }
}

const selectCard = (index: number) => {
  selectedIndex.value = index
  scrollToIndex(index)
}

const prevCard = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
    scrollToIndex(selectedIndex.value)
    triggerAnim('left')
  }
}

const nextCard = () => {
  if (selectedIndex.value < filteredCustomers.value.length - 1) {
    selectedIndex.value++
    scrollToIndex(selectedIndex.value)
    triggerAnim('right')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (isSmallView.value) return // Disable in grid view
  // Stop if focused on input
  if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

  if (e.key === 'ArrowLeft') {
    prevCard()
  } else if (e.key === 'ArrowRight') {
    nextCard()
  } else if (e.key === 'Enter') {
    // Action on enter? For now just log or visually confirm
    console.log('Selected customer:', filteredCustomers.value[selectedIndex.value])
  }
}

watch(filteredCustomers, () => {
  selectedIndex.value = 0
})

onMounted(() => {
  handleScroll()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const toggleView = () => {
  isSmallView.value = !isSmallView.value
}
</script>

<template>
  <div class="customers-page">
    <div class="page-header">
      <div class="header-text">
        <h1>Kundenverwaltung</h1>
        <p>Bitte wählen Sie den zu verwaltenden Kunden aus.</p>
      </div>
      <div class="search-wrapper">
        <AppInput
          v-model="searchQuery"
          :icon="Search"
        />
      </div>
    </div>

    <div 
      class="cards-scroll-container" 
      ref="scrollContainer"
      @mousedown="startDrag"
      @mouseleave="stopDrag"
      @mouseup="stopDrag"
      @mousemove="moveDrag"
      @scroll="handleScroll"
      :class="{ 'active': isDown, 'grid-view': isSmallView }"
    >
      <div class="cards-grid" :class="{ 'small-view': isSmallView }">
        <div
            v-for="(customer, index) in filteredCustomers"
            :key="customer.id"
            class="customer-card-wrapper"
            :class="{ 
              'pointer-events-none': isDragging,
              'selected': !isSmallView && index === selectedIndex
            }"
            @click="!isSmallView && selectCard(index)"
        >
          <div class="customer-card">
            <h3>{{ customer.name }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-controls">
      <div class="nav-btn-wrapper start">
        <button 
          class="nav-btn" 
          v-show="canScrollLeft" 
          @click="prevCard"
          :class="{ 'active-anim': highlightLeft }"
        >
          <ArrowLeft :size="32" />
        </button>
      </div>

      <button class="toggle-btn" @click="toggleView">
        <LayoutGrid v-if="!isSmallView" :size="24" color="white" />
        <GalleryHorizontal v-else :size="24" color="white" />
      </button>

      <div class="nav-btn-wrapper end">
        <button 
          class="nav-btn" 
          v-show="canScrollRight" 
          @click="nextCard"
          :class="{ 'active-anim': highlightRight }"
        >
          <ArrowRight :size="32" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customers-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px 40px;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden; /* Prevent page scroll */
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  text-align: center;
  position: relative;
  flex-shrink: 0;
}

.header-text {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text);
}

p {
  color: var(--text-muted);
  font-size: 16px;
  margin: 0;
  font-weight: 500;
}



.search-wrapper {
  position: absolute;
  right: 0;
  top: 0;
  width: 300px; /* Fixed width for the search bar */
  z-index: 10;
}

.cards-scroll-container {
  flex: 1;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 0 -40px;
  padding: 0 40px 0 40px;
  scrollbar-width: none;
  cursor: grab;
  user-select: none; /* Prevent text selection while dragging */
}

.cards-scroll-container.active {
  cursor: grabbing;
  transform: scale(1); 
}

.cards-scroll-container.grid-view {
  overflow-y: hidden;
  overflow-x: auto;
  align-items: stretch; /* Let children determine alignment via margin auto */
  height: 100%; /* Ensure it fills height to allow 2 rows */
  padding: 10px 20px 40px 20px; /* Reduced top padding to save vertical space */
}

.cards-grid {
  display: flex;
  gap: 60px;
  margin: 0 auto;
  transition: all 0.5s ease;
  width: fit-content;
  width: fit-content;
  align-items: center;
  padding-right: 40px; /* Ensure visual padding at end of scroll */
}

.cards-grid.small-view {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, min-content);
  grid-template-columns: none;
  justify-items: center;
  align-content: center; /* Center the grid vertically in the container */
}

.customer-card-wrapper {
  transition: all 0.5s ease;
  width: 280px;
  height: 280px;
  flex-shrink: 0;
  cursor: pointer;
}

.customer-card-wrapper.selected {
  transform: scale(1.08); /* Highlight selected card */
  z-index: 2;
}

.customer-card-wrapper.pointer-events-none {
  pointer-events: none;
}

/* Compact Grid View Styles */
.cards-grid.small-view .customer-card-wrapper {
  width: 140px;
  height: 140px;
}

.customer-card {
  width: 100%;
  height: 100%;
  background: var(--surface);
  border-radius: var(--radius-l);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-m);
  transition: all 0.3s ease;
}

.customer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.08); /* Slightly stronger shadow on hover */
}

h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.cards-grid.small-view h3 {
  font-size: 16px;
}

.bottom-controls {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}

.nav-btn-wrapper {
  display: flex;
  align-items: center;
}

.nav-btn-wrapper.start {
  justify-content: flex-start;
}

.nav-btn-wrapper.end {
  justify-content: flex-end;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  padding: 10px;
  transition: transform 0.1s ease-out;
}

.nav-btn.active-anim {
  transform: scale(1.2) !important; /* Larger animation on trigger */
  color: #b8141c; /* Optional: flash color */
}

.nav-btn:hover {
  transform: scale(1.1);
}

.toggle-btn {
  width: 80px;
  height: 60px;
  background: #b8141c;
  border: none;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(184, 20, 28, 0.3);
  transition: transform 0.1s, background-color 0.2s;
}

.toggle-btn:active {
  transform: scale(0.95);
}

.toggle-btn:hover {
  background: #a01219;
}
</style>
