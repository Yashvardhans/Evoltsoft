<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Create Account</h1>
        <p>Register to manage charging stations</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
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
            @blur="validateUsername"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            :class="{ 'input-error': errors.email }"
            @blur="validateEmail"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="new-password"
            :class="{ 'input-error': errors.password }"
            @blur="validatePassword"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          <div class="password-hints" v-if="form.password">
            <p :class="{ 'valid': hasMinLength }">• At least 8 characters</p>
            <p :class="{ 'valid': hasNumber }">• Contains a number</p>
            <p :class="{ 'valid': hasSpecialChar }">• Contains a special character</p>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            :class="{ 'input-error': errors.confirmPassword }"
            @blur="validateConfirmPassword"
          />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading" class="btn-primary">
            <span v-if="isLoading">Creating account...</span>
            <span v-else>Register</span>
          </button>
        </div>
      </form>

      <div class="auth-footer">
        <p>Already have an account? <router-link :to="{ name: 'login' }">Sign in</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const isLoading = ref(false)

// Password strength indicators
const hasMinLength = computed(() => form.password.length >= 8)
const hasNumber = computed(() => /\d/.test(form.password))
const hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(form.password))

const validateUsername = () => {
  if (!form.username.trim()) {
    errors.username = 'Username is required'
    return false
  } else if (form.username.length < 3) {
    errors.username = 'Username must be at least 3 characters'
    return false
  } else {
    errors.username = ''
    return true
  }
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email.trim()) {
    errors.email = 'Email is required'
    return false
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email'
    return false
  } else {
    errors.email = ''
    return true
  }
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = 'Password is required'
    return false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    return false
  } else if (!hasNumber.value) {
    errors.password = 'Password must contain a number'
    return false
  } else if (!hasSpecialChar.value) {
    errors.password = 'Password must contain a special character'
    return false
  } else {
    errors.password = ''
    return true
  }
}

const validateConfirmPassword = () => {
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    return false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  } else {
    errors.confirmPassword = ''
    return true
  }
}

const validateForm = () => {
  const validUsername = validateUsername()
  const validEmail = validateEmail()
  const validPassword = validatePassword()
  const validConfirmPassword = validateConfirmPassword()
  
  return validUsername && validEmail && validPassword && validConfirmPassword
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  error.value = ''

  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    })
    
    // Redirect to login with success message
    router.push({ 
      name: 'login',
      query: { registered: 'true' }
    })
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.'
    
    // Handle specific field errors from backend
    if (err.response?.data?.errors) {
      for (const [field, message] of Object.entries(err.response.data.errors)) {
        if (field in errors) {
          errors[field] = message
        }
      }
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #666;
  font-size: 0.875rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-group input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.input-error {
  border-color: #ef4444 !important;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
}

.password-hints {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #666;
}

.password-hints p {
  margin: 0.2rem 0;
  color: #ef4444;
}

.password-hints .valid {
  color: #10b981;
}

.alert-error {
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-actions {
  margin-top: 1.5rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #4338ca;
}

.btn-primary:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #666;
}

.auth-footer a {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>