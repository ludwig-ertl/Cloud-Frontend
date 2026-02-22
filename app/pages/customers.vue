<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { Search, ArrowLeft, ArrowRight, LayoutGrid, GalleryHorizontal, MapPin, Network, Monitor, Radio, Plus, Edit, Trash2 } from 'lucide-vue-next'
import AppModal from '~/components/AppModal.vue'
import AppButton from '~/components/AppButton.vue'
import AppInput from '~/components/AppInput.vue'

definePageMeta({
  layout: 'customer'
})

const { customers: apiCustomers, fetchCustomers, loading, createCustomer, updateCustomer, deleteCustomer } = useCustomers()
const customers = computed(() => apiCustomers.value)

// isSmallView removed

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

// Debounce search to avoid too many API calls
let searchTimeout: NodeJS.Timeout
watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchCustomers({ searchTerm: newQuery })
  }, 300)
})

const filteredCustomers = computed(() => {
    return customers.value // Filtering is done by API
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
  
  const customer = filteredCustomers.value[index]
  if (customer && customer.proxyUrl) {
    window.open(customer.proxyUrl, '_blank')
  }
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
  fetchCustomers()
  handleScroll()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// toggleView removed

// --- Device Management Logic ---

const showModal = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const deleteModalOpen = ref(false)
const subscribing = ref(false)
const itemToDelete = ref<any>(null)

const formData = ref({
  id: 0,
  deviceName: '',
  deviceType: '',
  description: '',
  ipAddress: '',
  macAddress: '',
  status: 'Active',
  location: '',
  proxyUrl: '',
  rowVersion: ''
})

const resetForm = () => {
  formData.value = {
    id: 0,
    deviceName: '',
    deviceType: '',
    description: '',
    ipAddress: '',
    macAddress: '',
    status: 'Active',
    location: '',
    proxyUrl: '',
    rowVersion: ''
  }
}

const openAddModal = () => {
  resetForm()
  modalMode.value = 'add'
  showModal.value = true
}

const openEditModal = (customer: any) => {
  formData.value = { ...customer }
  modalMode.value = 'edit'
  showModal.value = true
}

const openDeleteModal = (customer: any) => {
  itemToDelete.value = customer
  deleteModalOpen.value = true
}

const handleSave = async () => {
  subscribing.value = true
  try {
    // Convert proxyPort removed as field is gone

    if (modalMode.value === 'add') {
      await createCustomer(formData.value)
    } else {
      await updateCustomer(formData.value.id, formData.value)
    }
    showModal.value = false
    resetForm()
  } catch (e) {
    console.error('Failed to save:', e)
  } finally {
    subscribing.value = false
  }
}

const handleDelete = async () => {
  if (!itemToDelete.value) return
  subscribing.value = true
  try {
    await deleteCustomer(itemToDelete.value.id)
    deleteModalOpen.value = false
    itemToDelete.value = null
  } catch (e) {
    console.error('Failed to delete:', e)
  } finally {
    subscribing.value = false
  }
}
</script>

<template>
  <div class="customers-page">
    <div class="page-header">
      <div class="header-text">
        <h1>Kundenverwaltung</h1>
        <p>Clicken Sie auf ein Gerät um es zu verwalten.</p>
      </div>
      <div class="search-wrapper">
        <AppInput
          v-model="searchQuery"
          :icon="Search"
        />
        <AppButton variant="ghost" size="md" class="invisible-btn">
          <!-- Spacer or other header content if needed -->
        </AppButton>
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
      :class="{ 'active': isDown }"
    >
      <div class="cards-grid">
        <div
            v-for="(customer, index) in filteredCustomers"
            :key="customer.id"
            class="customer-card-wrapper"
            :class="{ 
              'pointer-events-none': isDragging,
              'selected': index === selectedIndex
            }"
            @click="selectCard(index)"
        >
          <div class="customer-card">
            <div class="status-badge-wrapper">
                <div class="status-badge" :class="customer.status?.toLowerCase()">
                    {{ customer.status === 'Active' ? 'Aktiv' : customer.status }}
                </div>
            </div>

            <div class="card-actions">
              <button class="action-btn edit" @click.stop="openEditModal(customer)">
                <Edit :size="16" />
              </button>
              <button class="action-btn delete" @click.stop="openDeleteModal(customer)">
                <Trash2 :size="16" />
              </button>
            </div>

            <div class="center-content">
                <h3>{{ customer.deviceName }}</h3>
                <p class="description" v-if="customer.description">{{ customer.description }}</p>
            </div>
            

            <div class="card-details-centered">
              <div class="info-item" v-if="customer.ipAddress">
                <Network :size="14" class="info-icon" />
                <span>{{ customer.ipAddress }}</span>
              </div>
              <div class="info-item" v-if="customer.location">
                <MapPin :size="14" class="info-icon" />
                <span>{{ customer.location }}</span>
              </div>
            </div>


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

      <button class="toggle-btn" @click="openAddModal">
        <Plus :size="32" color="white" />
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

    <!-- Add/Edit Modal -->
    <AppModal 
      :show="showModal" 
      :title="modalMode === 'add' ? 'Gerät hinzufügen' : 'Gerät bearbeiten'"
      @close="showModal = false"
    >
      <div class="form-grid">
        <AppInput label="Name" v-model="formData.deviceName" placeholder="z.B. Produktion-01" />
        <AppInput label="Typ" v-model="formData.deviceType" placeholder="z.B. Raspberry Pi 4" />
        
        <div class="form-group">
          <label>Status</label>
          <div class="status-options">
            <button 
              v-for="status in ['Active', 'Inactive', 'Maintenance']" 
              :key="status"
              type="button"
              class="status-option"
              :class="{ active: formData.status === status }"
              @click="formData.status = status"
            >
              {{ status === 'Active' ? 'Aktiv' : status }}
            </button>
          </div>
        </div>

        <AppInput label="Beschreibung" v-model="formData.description" placeholder="Optional" />
        <AppInput label="IP Adresse" v-model="formData.ipAddress" placeholder="192.168.x.x" />
        <AppInput label="MAC Adresse" v-model="formData.macAddress" placeholder="xx:xx:xx:xx:xx:xx" />
        <AppInput label="Standort" v-model="formData.location" placeholder="z.B. Halle 3" />
        
        <AppInput label="Proxy URL" v-model="formData.proxyUrl" placeholder="http://proxy.example.com" />
      </div>

      <template #footer>
        <AppButton variant="secondary" block @click="showModal = false">Abbrechen</AppButton>
        <AppButton block :loading="subscribing" @click="handleSave">Speichern</AppButton>
      </template>
    </AppModal>

    <!-- Delete Confirmation Modal -->
    <AppModal 
      :show="deleteModalOpen" 
      title="Gerät löschen"
      width="400px"
      @close="deleteModalOpen = false"
    >
      <div class="delete-content">
        <p>Sind Sie sicher, dass Sie das Gerät <strong>{{ itemToDelete?.deviceName }}</strong> löschen möchten?</p>
        <p class="warning-text">Diese Aktion kann nicht rückgängig gemacht werden.</p>
      </div>
      
      <template #footer>
        <AppButton variant="ghost" @click="deleteModalOpen = false">Abbrechen</AppButton>
        <AppButton variant="danger" :loading="subscribing" @click="handleDelete">Löschen</AppButton>
      </template>
    </AppModal>
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
  padding: 0 40px;
  scrollbar-width: none;
  cursor: grab;
  user-select: none;
  align-items: center; /* Vertically center */
  justify-content: center; /* Horizontally center */
}

.cards-scroll-container.active {
  cursor: grabbing;
  transform: scale(1); 
}



.cards-grid {
  display: flex;
  gap: 60px;
  margin: 0 auto; /* Horizontally center */
  transition: all 0.5s ease;
  width: fit-content;
  align-items: center;
  /* Removed padding-right to fix centering offset */
}



.customer-card-wrapper {
  transition: all 0.5s ease;
  width: 280px;
  height: 280px;
  flex-shrink: 0;
  cursor: pointer;
}

.customer-card-wrapper.selected {
  transform: scale(1.08);
  z-index: 2;
}

.customer-card-wrapper.pointer-events-none {
  pointer-events: none;
}

.customer-card {
  width: 100%;
  height: 100%;
  background: var(--surface);
  border-radius: var(--radius-l);
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centers the remaining flow content (center-content) */
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-m);
  transition: all 0.3s ease;
  gap: 0;
  position: relative;
}

.customer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.08); /* Slightly stronger shadow on hover */
}

.center-content {
    /* No margin auto needed if parent is justify-content: center */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    z-index: 1; /* Ensure text is above if overlaps */
}

h3 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.description {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis; 
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
}

.device-type {
  display: none; 
}


.status-badge-wrapper {
    position: absolute;
    top: 24px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    pointer-events: none; /* Let clicks pass through if needed, though card is click */
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: var(--surface-hover);
  color: var(--text-muted);
  pointer-events: auto;
}

.status-badge::before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.status-badge.active {
  background-color: color-mix(in srgb, var(--success), transparent 90%);
  color: var(--success);
}

.status-badge.inactive, 
.status-badge.offline {
  background-color: color-mix(in srgb, var(--error), transparent 90%);
  color: var(--error);
}

.card-details-centered {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 0 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.info-icon {
    opacity: 0.7;
}

/* Adjustments for small view */
.cards-grid.small-view h3 {
  font-size: 13px;
  margin-bottom: 2px;
}

.cards-grid.small-view .device-type,
.cards-grid.small-view .card-details-centered {
  display: none; 
}

.cards-grid.small-view .description {
  display: -webkit-box; /* Enable description */
  font-size: 10px;
  -webkit-line-clamp: 3; /* Show more lines? */
}

.cards-grid.small-view .status-badge-wrapper {
    top: 10px; /* Small card padding top */
}

.cards-grid.small-view .status-badge {
    /* Restore badge look for small view */
    width: auto;
    height: auto;
    padding: 2px 8px;
    font-size: 10px;
    border-radius: 12px;
    margin: 0;
}

.cards-grid.small-view .status-badge::before {
    display: block; /* Show dot */
    width: 4px;
    height: 4px;
}


.cards-grid.small-view .customer-card {
    padding: 10px;
}


.bottom-controls {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 20px;
  padding-bottom:30px;
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
  transform: scale(1.2); /* Larger animation on trigger */
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
/* Device Management Styles */
.add-btn {
  margin-left: 12px;
  width: 48px; /* Square button */
  padding: 0;
}

.add-btn {
  display: none;
}

.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 10;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  color: #888; /* Grey */
  transition: color 0.2s;
}

.action-btn:hover {
}

:deep(.modal-footer) {
    flex-direction: column !important;
    gap: 12px !important;
}

:deep(.secondary) {
    box-shadow: 0 0 10px #d6d9dd !important;
}

:deep(.secondary:hover) {
    transform: none !important;
}
.action-btn:hover {
  background: transparent;
  color: #000; /* Black */
}

.action-btn.delete:hover {
  color: #000;
}

.status-badge-wrapper {
    position: absolute;
    top: 12px;
    left: 12px;
    right: auto;
    width: auto; /* Ensure it doesn't span full width */
    display: flex;
    justify-content: flex-start;
    pointer-events: none;
    z-index: 10;
}

.status-badge {
    padding: 4px 10px;
    font-size: 11px;
}

.customer-card:hover .card-actions,
.customer-card-wrapper:hover .card-actions {
  opacity: 1;
}



/* Form Styles */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.status-options {
  display: flex;
  gap: 8px;
  background: var(--surface-hover);
  padding: 4px;
  border-radius: var(--radius-m);
}

.status-option {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: var(--radius-s);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.status-option.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  font-weight: 600;
}

.divider {
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.checkbox-wrapper {
    margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: var(--text);
}

.delete-content {
  padding: 10px 0;
}

.warning-text {
  color: var(--error);
  font-size: 13px;
  margin-top: 8px;
}
</style>
