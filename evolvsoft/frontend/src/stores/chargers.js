import { defineStore } from 'pinia'
import axios from '@/api'

export const useChargerStore = defineStore('chargers', {
  state: () => ({
    chargers: [],
    isLoading: false,
    error: null
  }),
  actions: {
    async fetchChargers() {
      this.isLoading = true
      this.error = null
      try {
        const response = await axios.get('/stations')
        console.log('Fetched chargers:', response);
        
        
        this.chargers = response.stations || []
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch chargers'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async getUserLocation() {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            position => {
              this.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
              resolve(this.userLocation)
            },
            error => {
              console.error('Geolocation error:', error)
              reject(error)
            },
            { timeout: 10000 }
          )
        } else {
          reject(new Error('Geolocation is not supported by this browser'))
        }
      })
    },
    async addCharger(chargerData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await axios.post('/stations', chargerData)
        this.chargers.push(response.data.station)
        return response.data.station
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add charger'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async updateCharger(chargerData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await axios.put(`/stations/${chargerData.id}`, chargerData)
        const index = this.chargers.findIndex(c => c.id === chargerData.id)
        if (index !== -1) {
          this.chargers.splice(index, 1, response.data.station)
        }
        return response.data.station
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update charger'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async deleteCharger(id) {
      this.isLoading = true
      this.error = null
      try {
        await axios.delete(`/stations/${id}`)
        this.chargers = this.chargers.filter(c => c.id !== id)
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete charger'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})