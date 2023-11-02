<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-4">
        <h1 class="app-name">Shteddy</h1>
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="onSubmit">
              <div class="form-group">
                <label for="username">Username</label>
                <input
                    type="text"
                    id="username"
                    v-model="form.username"
                    class="form-control"
                    placeholder="Enter your username">
              </div>

              <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    v-model="form.password"
                    class="form-control"
                    placeholder="Enter your password">
              </div>
              <p v-if="error" class="error-text">{{ error }}</p>

              <button type="submit" class="login-button">Log in</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const form = ref({
  username: '',
  password: ''
})

const error = ref('')

const onSubmit = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/login', form.value)
    if (response.data && response.data.username) {
      router.push({
        name: 'overview',
        params: { user: response.data }
      })
    } else {
      error.value = 'Invalid credentials'
    }
  } catch (err) {
    error.value = err.response?.data || 'Error logging in. Please try again.'
  }
}
</script>

<style scoped>
.app-name {
  font-family: 'Your Desired Font', sans-serif;
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  color: white;
}
.error-text {
  color: red;
  margin-bottom: 10px;
}
</style>
