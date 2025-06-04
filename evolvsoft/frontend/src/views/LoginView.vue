<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>EV Charging Manager</h1>
        <p>Sign in to your account</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            autocomplete="username"
            :class="{ 'input-error': errors.username }"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            :class="{ 'input-error': errors.password }"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading" class="btn-primary">
            <span v-if="isLoading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>

      <div class="login-footer">
        <p>Don't have an account? <router-link to="/register">Register</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const error = ref('')
const isLoading = ref(false)

const validate = () => {
  let valid = true
  
  if (!form.username.trim()) {
    errors.username = 'Username is required'
    valid = false
  } else {
    errors.username = ''
  }
  

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    valid = false
  } else {
    errors.password = ''
  }

  return valid
}

const handleSubmit = async () => {
  if (!validate()) return

  isLoading.value = true
  error.value = ''

  try {
    await authStore.login({
      username: form.username,
      password: form.password
    })
    router.push({ name: 'dashboard' }) 
  } catch (err) {
    console.log(error, err.response);
    
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import '../styles/login.css';
</style>