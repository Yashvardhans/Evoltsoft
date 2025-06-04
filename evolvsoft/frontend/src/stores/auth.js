import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref(null)
  const isAuthenticated = ref(false)
  const initialize = async () => {
    if (token.value) {
      try {
        isAuthenticated.value = true
      } catch (err) {
        logout()
      }
    }
  }
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.post('/auth/login', credentials)
      token.value = response.token
      localStorage.setItem('token', token.value)
      console.log("token",token.value);
      isAuthenticated.value = true
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      const redirect = router.currentRoute.value.query.redirect || '/'
      router.push(redirect)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  const register = async (userData) => {
  isLoading.value = true
  error.value = null
  try {
    const response = await axios.post('/auth/register', userData)
    token.value = response.token
    localStorage.setItem('token', token.value)
    isAuthenticated.value = true
    return response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.'
    console.log(err);
    throw err
  } finally {
    isLoading.value = false
  }
}
  const logout = () => {
    token.value = null
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    router.push({ name: 'login' })
  }
  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    initialize,
    login,
    register,
    logout
  }
})
