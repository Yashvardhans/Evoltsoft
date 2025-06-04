<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ mode === 'create' ? 'Add New Charger' : 'Edit Charger' }}</h2>
        <button @click="close" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="submit" class="modal-form">
        <div class="form-group">
          <label>Name *</label>
          <input v-model="formData.name" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Latitude *</label>
            <input 
              v-model.number="formData.latitude" 
              type="number" 
              step="0.000001"
              required
            >
          </div>
          
          <div class="form-group">
            <label>Longitude *</label>
            <input 
              v-model.number="formData.longitude" 
              type="number" 
              step="0.000001"
              required
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Power Output (kW) *</label>
            <input 
              v-model.number="formData.power_output" 
              type="number" 
              min="0"
              step="0.1"
              required
            >
          </div>
          
          <div class="form-group">
            <label>Status *</label>
            <select v-model="formData.status" required>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label>Connector Type</label>
          <select v-model="formData.connector_type">
            <option value="">Select type</option>
            <option 
              v-for="type in connectorTypes" 
              :value="type" 
              :key="type"
            >
              {{ type }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="formData.description" rows="3"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="close" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" class="btn-submit">
            {{ mode === 'create' ? 'Create' : 'Update' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'

const props = defineProps({
  charger: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value)
  }
})

const emit = defineEmits(['close', 'save'])

const connectorTypes = [
  'Type 1 (J1772)',
  'Type 2 (Mennekes)',
  'CCS (Combo 1)',
  'CCS (Combo 2)',
  'CHAdeMO',
  'Tesla'
]

const initialFormData = () => ({
  name: '',
  latitude: 0,
  longitude: 0,
  power_output: 0,
  status: 'Active',
  connector_type: '',
  description: ''
})

const formData = reactive(initialFormData())

onMounted(() => {
  resetForm()
})

const resetForm = () => {
  Object.assign(formData, initialFormData())
}

watch(() => props.charger, (newVal) => {
  if (newVal) {
    Object.assign(formData, {
      name: newVal.name,
      latitude: newVal.latitude,
      longitude: newVal.longitude,
      power_output: newVal.power_output,
      status: newVal.status,
      connector_type: newVal.connector_type || '',
      description: newVal.description || ''
    })
  } else {
    resetForm()
  }
}, { immediate: true })

const close = () => {
  emit('close')
}

const submit = () => {
  const dataToSave = { ...formData }
  console.log('Saving charger data:', dataToSave);
  if (props.mode === 'edit' && props.charger?.id) {
    dataToSave.id = props.charger.id
  }
  emit('save', dataToSave)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #64748b;
}

.close-btn:hover {
  color: #475569;
}

.modal-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  padding: 10px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  color: #64748b;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-submit {
  padding: 10px 20px;
  background: #4f46e5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.btn-submit:hover {
  background: #4338ca;
}
</style>