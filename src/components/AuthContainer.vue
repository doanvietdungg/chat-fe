<template>
  <div class="auth-container">
    <div class="auth-background">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon">💬</div>
          <h1 class="logo-text">ChatApp</h1>
        </div>

        <div class="auth-content">
          <transition name="form-slide" mode="out-in">
            <LoginForm
              v-if="currentView === 'login'"
              key="login"
              @switch-to-register="switchToRegister"
              @login-success="handleAuthSuccess"
            />
            
            <RegisterForm
              v-else-if="currentView === 'register'"
              key="register"
              @switch-to-login="switchToLogin"
              @register-success="handleAuthSuccess"
            />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

const emit = defineEmits(['auth-success'])

const currentView = ref('login')

const switchToRegister = () => {
  currentView.value = 'register'
}

const switchToLogin = () => {
  currentView.value = 'login'
}

const handleAuthSuccess = () => {
  emit('auth-success')
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.auth-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  overflow-y: auto;
  padding: 20px 0;
}

.auth-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
  animation: backgroundFloat 20s ease-in-out infinite;
}

.auth-background::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
  animation: backgroundMove 40s linear infinite;
  pointer-events: none;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.15),
    0 16px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  position: relative;
  z-index: 1;
  animation: cardFloat 6s ease-in-out infinite;
  margin: 20px 0;
}

.auth-logo {
  text-align: center;
  padding: 48px 20px 32px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  position: relative;
  overflow: hidden;
}

.auth-logo::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
}

.logo-icon {
  font-size: 56px;
  margin-bottom: 16px;
  display: inline-block;
  animation: bounce 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  position: relative;
  z-index: 1;
}

.logo-text {
  font-size: 36px;
  font-weight: 800;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.auth-content {
  padding: 0;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes backgroundFloat {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

@keyframes backgroundMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-50px, -50px);
  }
}

@keyframes cardFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Form transition animations */
.form-slide-enter-active,
.form-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.form-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.form-slide-enter-to,
.form-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .auth-container {
    padding: 12px;
    align-items: flex-start;
  }
  
  .auth-background {
    padding: 12px 0;
    align-items: flex-start;
  }
  
  .auth-card {
    border-radius: 20px;
    max-width: 100%;
    margin: 10px 0;
    max-height: 95vh;
  }
  
  .auth-content {
    max-height: calc(95vh - 120px);
  }
  
  .auth-logo {
    padding: 32px 20px 20px;
  }
  
  .logo-icon {
    font-size: 44px;
    margin-bottom: 12px;
  }
  
  .logo-text {
    font-size: 28px;
  }
}

@media (max-width: 320px) {
  .auth-container {
    padding: 8px;
  }
  
  .auth-background {
    padding: 8px 0;
  }
  
  .auth-card {
    margin: 5px 0;
    max-height: 98vh;
  }
  
  .auth-content {
    max-height: calc(98vh - 110px);
  }
  
  .auth-logo {
    padding: 28px 16px 16px;
  }
  
  .logo-icon {
    font-size: 40px;
    margin-bottom: 10px;
  }
  
  .logo-text {
    font-size: 24px;
  }
}

/* Tablet responsive */
@media (max-width: 768px) and (min-width: 481px) {
  .auth-container {
    padding: 16px;
  }
  
  .auth-background {
    padding: 16px 0;
  }
  
  .auth-card {
    max-width: 520px;
    margin: 15px 0;
  }
  
  .auth-logo {
    padding: 40px 24px 28px;
  }
  
  .logo-icon {
    font-size: 52px;
  }
  
  .logo-text {
    font-size: 32px;
  }
}

/* Desktop enhancements */
@media (min-width: 1024px) {
  .auth-container {
    padding: 24px;
    align-items: center;
  }
  
  .auth-background {
    align-items: center;
    padding: 24px 0;
  }
  
  .auth-card {
    max-width: 520px;
    max-height: 85vh;
    margin: 0;
  }
  
  .auth-content {
    max-height: calc(85vh - 160px);
  }
  
  .auth-logo {
    padding: 52px 24px 36px;
  }
  
  .logo-icon {
    font-size: 60px;
    margin-bottom: 18px;
  }
  
  .logo-text {
    font-size: 38px;
  }
}
</style>