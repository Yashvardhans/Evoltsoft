<template>
  <div class="charger-list-container">
    <div class="header">
      <h1>Charging Stations</h1>
      <div class="actions">
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> Add Charger
        </button>
        <button @click="refreshChargers" class="btn-secondary">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Power Output (kW)</label>
        <div class="range-inputs">
          <input 
            v-model.number="filters.minPower" 
            type="number" 
            placeholder="Min" 
            @change="applyFilters"
          >
          <span>to</span>
          <input 
            v-model.number="filters.maxPower" 
            type="number" 
            placeholder="Max" 
            @change="applyFilters"
          >
        </div>
      </div>

      <div class="filter-group">
        <label>Connector Type</label>
        <select v-model="filters.connectorType" @change="applyFilters">
          <option value="">All Types</option>
          <option v-for="type in connectorTypes" :value="type" :key="type">
            {{ type }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Search</label>
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search by name..." 
          
        >
      </div>
    </div>

    <div class="sort-options">
      <span>Sort by:</span>
      <button 
        @click="sortBy('name')" 
        :class="{ active: sort.field === 'name' }"
      >
        Name {{ sortIcon('name') }}
      </button>
      <button 
        @click="sortBy('power_output')" 
        :class="{ active: sort.field === 'power_output' }"
      >
        Power {{ sortIcon('power_output') }}
      </button>
      <button 
        @click="sortBy('created_at')" 
        :class="{ active: sort.field === 'created_at' }"
      >
        Date Added {{ sortIcon('created_at') }}
      </button>
    </div>

    <div v-if="loading" class="loading-indicator">
      <i class="fas fa-spinner fa-spin"></i> Loading chargers...
    </div>

    <div v-else-if="filteredChargers.length === 0" class="empty-state">
      <i class="fas fa-plug"></i>
      <p>No charging stations found</p>
      <button @click="resetFilters" class="btn-secondary">
        Reset Filters
      </button>
    </div>

    <div v-else class="charger-grid">
      <div 
        v-for="charger in paginatedChargers" 
        :key="charger.id" 
        class="charger-card"
        :class="{
          'active': charger.status === 'Active',
          'inactive': charger.status === 'Inactive'
        }"
      >
        <div class="card-header">
          <h3>{{ charger.name }}</h3>
          <span class="status-badge">{{ charger.status }}</span>
        </div>
        
        <div class="card-body">
          <div class="detail-row">
            <i class="fas fa-bolt"></i>
            <span>{{ charger.power_output }} kW</span>
          </div>
          <div class="detail-row">
            <i class="fas fa-plug"></i>
            <span>{{ charger.connector_type || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <i class="fas fa-map-marker-alt"></i>
            <span>
              {{ charger.latitude.toFixed(4) }}, {{ charger.longitude.toFixed(4) }}
            </span>
          </div>
          <div class="detail-row">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formatDate(charger.created_at) }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button @click="openEditModal(charger)" class="btn-edit">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button @click="openMap(charger)" class="btn-view">
            <i class="fas fa-map"></i> View
          </button>
          <button @click="confirmDelete(charger.id)" class="btn-delete">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredChargers.length > 0" class="pagination">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Charger Form Modal -->
    <ChargerFormModal
      v-if="showModal"
      :charger="selectedCharger"
      :mode="modalMode"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal"
      title="Delete Charger"
      message="Are you sure you want to delete this charging station?"
      @confirm="deleteCharger"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChargerStore } from '@/stores/chargers'

import ChargerFormModal from '@/components/ChargerFormModal.vue' 
import ConfirmModal from '@/components/ConfirmModal.vue'

const router = useRouter()
const chargerStore = useChargerStore()

// Data
const loading = ref(true)
const showModal = ref(false)
const showDeleteModal = ref(false)
const selectedCharger = ref(null)
const modalMode = ref('create') // 'create' or 'edit'
const chargerToDelete = ref(null)

const filters = reactive({
  status: '',
  minPower: null,
  maxPower: null,
  connectorType: '',
  search: ''
})

const connectorTypes = [
  'Type 1 (J1772)',
  'Type 2 (Mennekes)',
  'CCS (Combo 1)',
  'CCS (Combo 2)',
  'CHAdeMO',
  'Tesla'
]

// Sorting
const sort = reactive({
  field: 'name',
  direction: 'asc'
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12

// Computed properties
const filteredChargers = computed(() => {
  let result = chargerStore.chargers

  // Apply filters
  if (filters.status) {
    result = result.filter(c => c.status === filters.status)
  }

  if (filters.minPower) {
    result = result.filter(c => c.power_output >= filters.minPower)
  }

  if (filters.maxPower) {
    result = result.filter(c => c.power_output <= filters.maxPower)
  }

  if (filters.connectorType) {
    result = result.filter(c => c.connector_type === filters.connectorType)
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(searchTerm) ||
      (c.description && c.description.toLowerCase().includes(searchTerm))
    )
  }

  // Apply sorting
  return result.sort((a, b) => {
    const field = sort.field
    const direction = sort.direction === 'asc' ? 1 : -1
    
    if (a[field] < b[field]) return -1 * direction
    if (a[field] > b[field]) return 1 * direction
    return 0
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredChargers.value.length / itemsPerPage)
})

const paginatedChargers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredChargers.value.slice(start, end)
})

// Methods
const fetchChargers = async () => {
  loading.value = true
  try {
    await chargerStore.fetchChargers()
  } catch (error) {
    console.error('Failed to fetch chargers:', error)
  } finally {
    loading.value = false
  }
}



const applyFilters = () => {
  currentPage.value = 1 
}

const resetFilters = () => {
  filters.status = ''
  filters.minPower = null
  filters.maxPower = null
  filters.connectorType = ''
  filters.search = ''
  currentPage.value = 1
}

const sortBy = (field) => {
  if (sort.field === field) {
    sort.direction = sort.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sort.field = field
    sort.direction = 'asc'
  }
}

const sortIcon = (field) => {
  if (sort.field !== field) return ''
  return sort.direction === 'asc' ? '↑' : '↓'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const openCreateModal = () => {
  console.log("Opening create modal");
  
  selectedCharger.value = null
  modalMode.value = 'create'
  showModal.value = true
}

const openEditModal = (charger) => {
  selectedCharger.value = { ...charger }
  modalMode.value = 'edit'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const confirmDelete = (id) => {
  chargerToDelete.value = id
  showDeleteModal.value = true
}

const deleteCharger = async () => {
  try {
    await chargerStore.deleteCharger(chargerToDelete.value)
    showDeleteModal.value = false
    // If last item on page was deleted, go back a page
    if (paginatedChargers.value.length === 0 && currentPage.value > 1) {
      currentPage.value -= 1
    }
  } catch (error) {
    console.error('Failed to delete charger:', error)
  }
}

const handleSave = async (chargerData) => {
  try {
    if (modalMode.value === 'create') {
      await chargerStore.addCharger(chargerData)
    } else {
      await chargerStore.updateCharger(chargerData)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save charger:', error)
  }
}

const refreshChargers = () => {
  fetchChargers()
}

const openMap = (charger) => {
  router.push({
    name: 'map',
    query: {
      lat: charger.latitude,
      lng: charger.longitude
    }
  })
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchChargers()
})
</script>

<style scoped>
@import '../styles/dashboard.css';
</style>