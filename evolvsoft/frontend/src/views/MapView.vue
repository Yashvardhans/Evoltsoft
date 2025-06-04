<template>
  <div class="map-view">
    <div class="map-controls">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search chargers..."
          @input="searchChargers"
        >
        <button 
          @click="centerOnUser" 
          title="Center on my location"
          :disabled="geolocationBlocked"
        >
          <i class="fas fa-location-arrow"></i>
        </button>
      </div>
      
      <div class="filters">
        <label>
          <input type="checkbox" v-model="showActive" @change="applyFilters">
          Active
        </label>
        <label>
          <input type="checkbox" v-model="showInactive" @change="applyFilters">
          Inactive
        </label>
        <select v-model="selectedConnector" @change="applyFilters">
          <option value="">All Connectors</option>
          <option v-for="type in connectorTypes" :value="type" :key="type">
            {{ type }}
          </option>
        </select>
      </div>
    </div>
    
    <div v-if="mapError" class="error-banner">
      {{ mapError }}
      <button @click="initMap">Retry</button>
      <a href="https://developers.google.com/maps/documentation/javascript/error-messages#api-project-map-error" 
         target="_blank" 
         class="help-link"
      >
        Learn More
      </a>
    </div>
    
    <div class="map-container" v-if="!mapError">
      <GoogleMap
        v-if="apiKey"
        :api-key="apiKey"
        :center="mapCenter"
        :zoom="zoom"
        style="width: 100%; height: 100%"
        @click="closeInfoWindows"
        @idle="onMapIdle"
      >
        <MarkerCluster>
          <ChargerMarker
            v-for="charger in visibleChargers"
            :key="charger.id"
            :charger="charger"
            :show-info="selectedChargerId === charger.id"
            @marker-click="handleMarkerClick"
          />
        </MarkerCluster>
        
        <Marker 
          v-if="userLocation"
          :options="{
            position: userLocation,
            icon: userLocationIcon
          }"
        />
        
        <Circle
          v-if="userLocation"
          :options="userLocationCircle"
        />
      </GoogleMap>
    </div>
    
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading map data...</p>
    </div>
    
    <div v-if="geolocationBlocked" class="geolocation-warning">
      <i class="fas fa-exclamation-triangle"></i>
      <p>Geolocation permission blocked. 
        <a href="https://www.chromestatus.com/feature/6443143280984064" target="_blank">
          Learn how to reset permissions
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { GoogleMap, Marker, Circle, MarkerCluster } from 'vue3-google-map'
import { useChargerStore } from '@/stores/chargers'
import ChargerMarker from '@/components/ChargerMarker.vue'

const chargerStore = useChargerStore()

const apiKey = ref(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

const mapCenter = ref({ lat: 0, lng: 0 })
const zoom = ref(4)
const userLocation = ref(null)
const selectedChargerId = ref(null)
const loading = ref(true)
const mapError = ref(null)
const geolocationBlocked = ref(false)

const searchQuery = ref('')
const showActive = ref(true)
const showInactive = ref(false)
const selectedConnector = ref('')
const connectorTypes = [
  'Type 1 (J1772)',
  'Type 2 (Mennekes)',
  'CCS (Combo 1)',
  'CCS (Combo 2)',
  'CHAdeMO',
  'Tesla'
]

const userLocationIcon = {
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
  fillColor: '#3B82F6',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
  scale: 1.5,
  anchor: { x: 12, y: 24 }
}

const userLocationCircle = {
  center: userLocation,
  radius: 1000, 
  strokeColor: '#3B82F6',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#BFDBFE',
  fillOpacity: 0.3
}

const visibleChargers = computed(() => {
  return chargerStore.chargers.filter(charger => {
    const matchesStatus = 
      (showActive.value && charger.status === 'Active') ||
      (showInactive.value && charger.status === 'Inactive')
    const matchesConnector = 
      !selectedConnector.value || 
      charger.connector_type === selectedConnector.value
    const matchesSearch = 
      !searchQuery.value ||
      charger.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (charger.description && 
        charger.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesStatus && matchesConnector && matchesSearch
  })
})

const fetchChargers = async () => {
  loading.value = true
  mapError.value = null
  try {
    await chargerStore.fetchChargers()
    if (chargerStore.chargers.length > 0) {
      const firstCharger = chargerStore.chargers[0]
      mapCenter.value = { 
        lat: firstCharger.latitude, 
        lng: firstCharger.longitude 
      }
      zoom.value = 12
    }
  } catch (err) {
    mapError.value = 'Failed to load charging stations. ' + err.message
  } finally {
    loading.value = false
  }
}

const centerOnUser = async () => {
  try {
    if (geolocationBlocked.value) {
      mapError.value = 'Geolocation permission blocked. Please reset permissions in your browser settings.'
      return
    }
    const location = await chargerStore.getUserLocation()
    mapCenter.value = location
    zoom.value = 14
  } catch (err) {
    if (err.code === 1) {
      geolocationBlocked.value = true
      mapError.value = 'Geolocation permission blocked. Please reset permissions in your browser settings.'
    } else {
      mapError.value = `Could not get your location: ${err.message}`
    }
  }
}

const handleMarkerClick = (chargerId) => {
  selectedChargerId.value = chargerId
}

const closeInfoWindows = () => {
  selectedChargerId.value = null
}

const searchChargers = () => {
  console.log('Searching for:', searchQuery.value)
}

const applyFilters = () => {}

const onMapIdle = () => {}

const initMap = () => {
  mapError.value = null
  fetchChargers()
}

onMounted(async () => {
  if (!apiKey.value) {
    mapError.value = 'Google Maps API key is missing. Please configure your environment variables.'
    return
  }
  await fetchChargers()
})
</script>

<style scoped>
@import '../styles/map.css';
</style>