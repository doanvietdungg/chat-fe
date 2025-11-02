<template>
  <div class="auth-container">
    <AuthContainer @auth-success="handleAuthSuccess" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AuthContainer from '../components/AuthContainer.vue'

const router = useRouter()

function handleAuthSuccess() {
  // Redirect to chat after successful authentication
  router.push('/chat')
}
</script>

<style scoped>
.auth-container {
  height: 100vh;
  overflow: hidden;
}
</style>