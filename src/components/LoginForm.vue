<template>
  <div class="login-form">
    <div class="form-header">
      <h2 class="form-title">Đăng nhập</h2>
      <p class="form-subtitle">Chào mừng bạn quay trở lại!</p>
    </div>

    <a-form
      :model="formData"
      :rules="rules"
      @finish="handleSubmit"
      layout="vertical"
      class="login-form-content"
    >
      <a-form-item label="Email hoặc Username" name="usernameOrEmail">
        <a-input
          v-model:value="formData.usernameOrEmail"
          placeholder="Nhập email hoặc username"
          size="large"
        >
          <template #prefix>
            <MailOutlined class="input-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="Mật khẩu" name="password">
        <a-input-password
          v-model:value="formData.password"
          placeholder="Nhập mật khẩu"
          size="large"
        >
          <template #prefix>
            <LockOutlined class="input-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <div class="form-options">
          <a-checkbox v-model:checked="rememberMe">Ghi nhớ đăng nhập</a-checkbox>
          <a href="#" class="forgot-password">Quên mật khẩu?</a>
        </div>
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          size="large"
          block
          :loading="isLoading"
          class="login-button"
        >
          Đăng nhập
        </a-button>
      </a-form-item>

      <div class="form-footer">
        <span>Chưa có tài khoản? </span>
        <a @click="$emit('switch-to-register')" class="switch-link">Đăng ký ngay</a>
      </div>
    </a-form>

    <!-- Demo accounts -->
    <div class="demo-accounts">
      <div class="demo-title">Tài khoản demo</div>
      <div class="demo-buttons">
        <a-button size="small" @click="fillDemoAccount('admin')">
          👨‍💼 Admin
        </a-button>
        <a-button size="small" @click="fillDemoAccount('user')">
          👤 User
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { MailOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '../store/auth.js'
import { message } from 'ant-design-vue'

const emit = defineEmits(['switch-to-register', 'login-success'])

const authStore = useAuthStore()
const isLoading = ref(false)
const rememberMe = ref(false)

const formData = reactive({
  usernameOrEmail: '',
  password: ''
})

const rules = {
  usernameOrEmail: [
    { required: true, message: 'Vui lòng nhập email hoặc username!' }
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu!' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
  ]
}

const handleSubmit = async () => {
  isLoading.value = true
  
  try {
    await authStore.login(formData.usernameOrEmail, formData.password)
    message.success('Đăng nhập thành công!')
    emit('login-success')
  } catch (error) {
    message.error(error.message || 'Đăng nhập thất bại!')
  } finally {
    isLoading.value = false
  }
}

const fillDemoAccount = (type) => {
  if (type === 'admin') {
    formData.usernameOrEmail = 'admin'
    formData.password = 'secret'
  } else {
    formData.usernameOrEmail = 'alice'
    formData.password = 'secret'
  }
}
</script>

<style scoped>
.login-form {
  width: 100%;
  margin: 0 auto;
  padding: 0;
  background: transparent;
  animation: slideUp 0.6s ease-out;
  max-width: 440px;
}

.form-header {
  text-align: center;
  padding: 32px 40px;
  background: transparent;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #262626;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  color: #8c8c8c;
  font-size: 16px;
  margin: 0;
  font-weight: 400;
}

.login-form-content {
  padding: 40px 40px 32px 40px;
  margin-bottom: 0;
  display: grid;
  row-gap: 20px;
}

.login-form-content > * {
  animation: fadeInUp 0.6s ease-out;
}

.login-form-content > *:nth-child(1) {
  animation-delay: 0.1s;
}

.login-form-content > *:nth-child(2) {
  animation-delay: 0.2s;
}

.login-form-content > *:nth-child(3) {
  animation-delay: 0.3s;
}

.login-form-content > *:nth-child(4) {
  animation-delay: 0.4s;
}

.login-form-content > *:nth-child(5) {
  animation-delay: 0.5s;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

/* Ensure form control container uses full width */
:deep(.ant-form-item .ant-form-item-control) {
  width: 100%;
}

:deep(.ant-form-item .ant-form-item-control-input) {
  width: 100%;
}

.forgot-password {
  color: #1890ff;
  text-decoration: none;
}

.forgot-password:hover {
  color: #40a9ff;
}

.login-button {
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #9254de 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.4);
}

.login-button:hover::before {
  opacity: 1;
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.login-button:disabled {
  background: #d9d9d9;
  color: #bfbfbf;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.login-button:disabled::before {
  display: none;
}

.form-footer {
  text-align: center;
  color: #8c8c8c;
}

.switch-link {
  color: #1890ff;
  cursor: pointer;
  text-decoration: none;
}

.switch-link:hover {
  color: #40a9ff;
}

.demo-accounts {
  margin: 0;
  padding: 24px 40px 32px 40px;
  background: rgba(248, 250, 252, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.demo-title {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #8c8c8c;
  margin-bottom: 16px;
  position: relative;
}

.demo-title::before,
.demo-title::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 60px;
  height: 1px;
  background: linear-gradient(to right, transparent, #d9d9d9, transparent);
}

.demo-title::before {
  left: -80px;
}

.demo-title::after {
  right: -80px;
}

.demo-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

:deep(.demo-buttons .ant-btn) {
  border: 2px solid #e6f7ff;
  background: rgba(255, 255, 255, 0.8);
  color: #1890ff;
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 16px;
  height: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

:deep(.demo-buttons .ant-btn:hover) {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* Form item styles */
:deep(.ant-form-item) {
  margin-bottom: 36px;
}

:deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #262626;
  font-size: 14px;
  margin-bottom: 8px;
}

.input-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-input-affix-wrapper) {
  border: 2px solid #d9d9d9;
  border-radius: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  min-height: 52px;
  display: flex;
  align-items: center;
}

:deep(.ant-input-affix-wrapper::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

:deep(.ant-input-affix-wrapper:hover) {
  border-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
  transform: translateY(-1px);
}

:deep(.ant-input-affix-wrapper:hover::before) {
  left: 100%;
}

:deep(.ant-input-affix-wrapper-focused) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1), 0 4px 12px rgba(24, 144, 255, 0.15) !important;
  transform: translateY(-1px);
}

:deep(.ant-input) {
  font-size: 16px;
  background: transparent;
  border: none;
  padding: 0;
  font-weight: 500;
  color: #262626;
}

:deep(.ant-input::placeholder) {
  color: #bfbfbf;
  font-weight: 400;
}

:deep(.ant-input-prefix) {
  margin-right: 12px;
  color: #8c8c8c;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-input-affix-wrapper-focused .ant-input-prefix) {
  color: #1890ff;
}

:deep(.ant-input-affix-wrapper:hover .ant-input-prefix) {
  color: #40a9ff;
}

:deep(.ant-checkbox-wrapper) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.ant-form-item-has-error .ant-input-affix-wrapper) {
  border-color: #ff4d4f;
  animation: shake 0.6s ease-in-out, errorPulse 1s ease-in-out;
  background: rgba(255, 77, 79, 0.02);
}

:deep(.ant-form-item-has-error .ant-input-affix-wrapper:focus) {
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1), 0 4px 12px rgba(255, 77, 79, 0.15);
}

:deep(.ant-form-item-explain-error) {
  animation: fadeInUp 0.3s ease-out;
  font-weight: 500;
}

/* Loading state for form */
.login-form.loading {
  pointer-events: none;
}

.login-form.loading .login-form-content {
  animation: loadingPulse 1.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}

@keyframes errorPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(255, 77, 79, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
  }
}

@keyframes loadingPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
}

/* Mobile responsive */
@media (max-width: 480px) {
  .form-header {
    padding: 20px 24px 16px;
  }
  
  .form-title {
    font-size: 24px;
  }
  
  .form-subtitle {
    font-size: 14px;
  }
  
  .login-form-content {
    padding: 20px 24px 16px;
  }
  
  .demo-accounts {
    padding: 16px 24px 20px 24px;
  }
  
  .demo-buttons {
    flex-direction: row;
    gap: 10px;
  }
  
  :deep(.ant-form-item) {
    margin-bottom: 24px;
  }
  
  :deep(.ant-input-affix-wrapper) {
    padding: 12px 16px;
  }
  
  .login-button {
    height: 46px;
    font-size: 15px;
  }
}

@media (max-width: 320px) {
  .form-header {
    padding: 16px 20px 12px;
  }
  
  .form-title {
    font-size: 22px;
  }
  
  .form-subtitle {
    font-size: 13px;
  }
  
  .login-form-content {
    padding: 16px 20px 12px;
  }
  
  .demo-accounts {
    padding: 12px 20px 16px 20px;
  }
  
  .demo-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .demo-title::before,
  .demo-title::after {
    width: 30px;
  }
  
  .demo-title::before {
    left: -40px;
  }
  
  .demo-title::after {
    right: -40px;
  }
  
  :deep(.ant-form-item) {
    margin-bottom: 20px;
  }
  
  :deep(.ant-input-affix-wrapper) {
    padding: 10px 14px;
  }
  
  .login-button {
    height: 44px;
    font-size: 14px;
  }
}

/* Tablet responsive */
@media (max-width: 768px) and (min-width: 481px) {
  .form-header {
    padding: 32px;
  }
  
  .login-form-content {
    padding: 28px 32px;
  }
  
  .demo-accounts {
    padding: 22px 32px 28px 32px;
  }
}

/* Desktop enhancements */
@media (min-width: 1024px) {
  .form-header {
    padding: 40px 48px;
  }
  
  .form-title {
    font-size: 30px;
  }
  
  .form-subtitle {
    font-size: 17px;
  }
  
  .login-form-content {
    padding: 36px 48px 28px 48px;
  }
  
  .demo-accounts {
    padding: 28px 48px 36px 48px;
  }
  
  .login-button {
    height: 56px;
    font-size: 17px;
  }
  
  :deep(.ant-input-affix-wrapper) {
    padding: 18px 24px;
  }
  
  :deep(.ant-input) {
    font-size: 17px;
  }
}
</style>