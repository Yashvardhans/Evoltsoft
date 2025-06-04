<template>
  <Marker
    :options="markerOptions"
    @click="handleMarkerClick"
  >
    <InfoWindow v-if="showInfo && charger">
      <div class="info-window">
        <h3>{{ charger.name }}</h3>
        <p>
          <strong>Status:</strong>
          <span :class="statusClass">{{ charger.status }}</span>
        </p>
        <p><strong>Power Output:</strong> {{ charger.power_output }} kW</p>
        <p><strong>Connector:</strong> {{ connectorType }}</p>
        <p><strong>Location:</strong> {{ location }}</p>
        <div class="actions">
          <button @click="navigateToCharger">Directions</button>
          <button @click="viewDetails">Details</button>
        </div>
      </div>
    </InfoWindow>
  </Marker>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Marker, InfoWindow } from 'vue3-google-map'

const props = defineProps({
  charger: {
    type: Object,
    required: true
  },
  showInfo: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['marker-click'])
const router = useRouter()

const activeMarkerIcon = {
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
  fillColor: '#10B981',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
  scale: 1.5,
  anchor: { x: 12, y: 24 }
}

const inactiveMarkerIcon = {
  ...activeMarkerIcon,
  fillColor: '#EF4444'
}

const markerOptions = computed(() => ({
  position: {
    lat: props.charger.latitude,
    lng: props.charger.longitude
  },
  icon: props.charger.status === 'Active'
    ? activeMarkerIcon
    : inactiveMarkerIcon,
  title: props.charger.name
}))

const statusClass = computed(() => ({
  active: props.charger.status === 'Active',
  inactive: props.charger.status === 'Inactive'
}))

const connectorType = computed(() =>
  props.charger.connector_type || 'Not specified'
)

const location = computed(() =>
  `${props.charger.latitude.toFixed(4)}, ${props.charger.longitude.toFixed(4)}`
)

const handleMarkerClick = () => {
  emit('marker-click', props.charger.id)
}

const viewDetails = () => {
  router.push({ name: 'charger-details', params: { id: props.charger.id } })
}

const navigateToCharger = () => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${props.charger.latitude},${props.charger.longitude}`
  window.open(url, '_blank')
}
</script>

<style scoped>
.info-window {
  padding: 10px;
  min-width: 250px;
}

.info-window h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.info-window p {
  margin: 5px 0;
  font-size: 14px;
}

.info-window .active {
  color: #10b981;
  font-weight: 500;
}

.info-window .inactive {
  color: #ef4444;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.actions button {
  flex: 1;
  padding: 5px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #f8fafc;
}

.actions button:hover {
  background: #e2e8f0;
}
</style>
