<template>
  <div class="register-form">
    <div class="form-header">
      <h2 class="form-title">Đăng ký</h2>
      <p class="form-subtitle">Tạo tài khoản mới để bắt đầu trò chuyện</p>
    </div>

    <a-form
      :model="formData"
      :rules="rules"
      @finish="handleSubmit"
      layout="vertical"
      class="register-form-content"
    >
      <a-form-item label="Họ và tên" name="name">
        <a-input
          v-model:value="formData.name"
          placeholder="Nhập họ và tên"
          size="large"
        >
          <template #prefix>
            <UserOutlined class="input-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="Username" name="username">
        <a-input
          v-model:value="formData.username"
          placeholder="Nhập username"
          size="large"
        >
          <template #prefix>
            <span class="input-icon at-symbol">@</span>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="Email" name="email">
        <a-input
          v-model:value="formData.email"
          placeholder="Nhập email"
          size="large"
        >
          <template #prefix>
            <MailOutlined class="input-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="Số điện thoại" name="phone">
        <a-input
          v-model:value="formData.phone"
          placeholder="Nhập số điện thoại (tùy chọn)"
          size="large"
        >
          <template #prefix>
            <PhoneOutlined class="input-icon" />
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

      <a-form-item label="Xác nhận mật khẩu" name="confirmPassword">
        <a-input-password
          v-model:value="formData.confirmPassword"
          placeholder="Nhập lại mật khẩu"
          size="large"
        >
          <template #prefix>
            <LockOutlined class="input-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      

      <a-form-item name="agreement">
        <a-checkbox v-model:checked="formData.agreement">
          Tôi đồng ý với <a href="#" class="terms-link">Điều khoản sử dụng</a> và 
          <a href="#" class="terms-link">Chính sách bảo mật</a>
        </a-checkbox>
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          size="large"
          block
          :loading="isLoading"
          class="register-button"
        >
          Đăng ký
        </a-button>
      </a-form-item>

    </a-form>

    <div class="form-footer">
      <span>Đã có tài khoản? </span>
      <a @click="$emit('switch-to-login')" class="switch-link">Đăng nhập ngay</a>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  PhoneOutlined 
} from '@ant-design/icons-vue'
import { useAuthStore } from '../store/auth.js'
import { message } from 'ant-design-vue'

const emit = defineEmits(['switch-to-login', 'register-success'])

const authStore = useAuthStore()
const isLoading = ref(false)

const formData = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const rules = {
  name: [
    { required: true, message: 'Vui lòng nhập họ và tên!' },
    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
  ],
  username: [
    { required: true, message: 'Vui lòng nhập username!' },
    { min: 3, message: 'Username phải có ít nhất 3 ký tự!' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username chỉ được chứa chữ, số và dấu gạch dưới!' }
  ],
  email: [
    { required: true, message: 'Vui lòng nhập email!' },
    { type: 'email', message: 'Email không hợp lệ!' }
  ],
  phone: [
    { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ!' }
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu!' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
  ],
  confirmPassword: [
    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
    {
      validator: (_, value) => {
        if (value !== formData.password) {
          return Promise.reject('Mật khẩu xác nhận không khớp!')
        }
        return Promise.resolve()
      }
    }
  ],
  agreement: [
    {
      validator: (_, value) => {
        if (!value) {
          return Promise.reject('Vui lòng đồng ý với điều khoản sử dụng!')
        }
        return Promise.resolve()
      }
    }
  ]
}

const handleSubmit = async () => {
  isLoading.value = true
  
  try {
    const userData = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    }

    await authStore.register(userData)
    message.success('Đăng ký thành công!')
    emit('register-success')
  } catch (error) {
    message.error(error.message || 'Đăng ký thất bại!')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-form {
  width: 100%;
  margin: 0 auto;
  padding: 0;
  background: transparent;
  animation: slideUp 0.6s ease-out;
  max-width: 520px;
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
}

.register-form-content {
  padding: 40px 40px 32px 40px;
  margin-bottom: 0;
  display: grid;
  row-gap: 20px;
}

.register-form-content > * {
  animation: fadeInUp 0.6s ease-out;
}

.register-form-content > *:nth-child(1) { animation-delay: 0.1s; }
.register-form-content > *:nth-child(2) { animation-delay: 0.15s; }
.register-form-content > *:nth-child(3) { animation-delay: 0.2s; }
.register-form-content > *:nth-child(4) { animation-delay: 0.25s; }
.register-form-content > *:nth-child(5) { animation-delay: 0.3s; }
.register-form-content > *:nth-child(6) { animation-delay: 0.35s; }
.register-form-content > *:nth-child(7) { animation-delay: 0.4s; }
.register-form-content > *:nth-child(8) { animation-delay: 0.45s; }
.register-form-content > *:nth-child(9) { animation-delay: 0.5s; }
.register-form-content > *:nth-child(10) { animation-delay: 0.55s; }

.terms-link {
  color: #1890ff;
  text-decoration: none;
}

.terms-link:hover {
  color: #40a9ff;
}

.register-button {
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #52c41a 0%, #1890ff 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(82, 196, 26, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.register-button::before {
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

.register-button:hover {
  background: linear-gradient(135deg, #73d13d 0%, #40a9ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(82, 196, 26, 0.4);
}

.register-button:hover::before {
  opacity: 1;
}

.register-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
}

.register-button:disabled {
  background: #d9d9d9;
  color: #bfbfbf;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.register-button:disabled::before {
  display: none;
}

.form-footer {
  text-align: center;
  color: #8c8c8c;
  padding: 0 40px 32px 40px;
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.switch-link {
  color: #1890ff;
  cursor: pointer;
  text-decoration: none;
}

.switch-link:hover {
  color: #40a9ff;
}

/* Form item styles */
:deep(.ant-form-item) {
  margin-bottom: 36px;
}

:deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

/* Ensure form control container uses full width */
:deep(.ant-form-item .ant-form-item-control) {
  width: 100%;
}

:deep(.ant-form-item .ant-form-item-control-input) {
  width: 100%;
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

.at-symbol {
  font-weight: 600;
  font-size: 18px;
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
  background: linear-gradient(90deg, transparent, rgba(82, 196, 26, 0.1), transparent);
  transition: left 0.6s ease;
}

:deep(.ant-input-affix-wrapper:hover) {
  border-color: #73d13d;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.1);
  transform: translateY(-1px);
}

:deep(.ant-input-affix-wrapper:hover::before) {
  left: 100%;
}

:deep(.ant-input-affix-wrapper-focused) {
  border-color: #52c41a !important;
  box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.1), 0 4px 12px rgba(82, 196, 26, 0.15) !important;
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
  color: #52c41a;
}

:deep(.ant-input-affix-wrapper:hover .ant-input-prefix) {
  color: #73d13d;
}

:deep(.ant-textarea) {
  border: 2px solid #d9d9d9;
  border-radius: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  resize: vertical;
  min-height: 90px;
  box-sizing: border-box;
  width: 100%;
}

:deep(.ant-textarea:hover) {
  border-color: #73d13d;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.1);
  transform: translateY(-1px);
}

:deep(.ant-textarea:focus) {
  border-color: #52c41a;
  box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.1), 0 4px 12px rgba(82, 196, 26, 0.15);
  transform: translateY(-1px);
}

:deep(.ant-textarea::placeholder) {
  color: #bfbfbf;
  font-weight: 400;
}

:deep(.ant-checkbox-wrapper) {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
}

:deep(.ant-form-item-has-error .ant-input-affix-wrapper),
:deep(.ant-form-item-has-error .ant-textarea) {
  border-color: #ff4d4f;
  animation: shake 0.6s ease-in-out, errorPulse 1s ease-in-out;
  background: rgba(255, 77, 79, 0.02);
}

:deep(.ant-form-item-has-error .ant-input-affix-wrapper:focus),
:deep(.ant-form-item-has-error .ant-textarea:focus) {
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1), 0 4px 12px rgba(255, 77, 79, 0.15);
}

:deep(.ant-form-item-explain-error) {
  animation: fadeInUp 0.3s ease-out;
  font-weight: 500;
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
  
  .register-form-content {
    padding: 0 24px 20px 24px;
  }
  
  .form-footer {
    padding: 0 24px 20px 24px;
  }
  
  :deep(.ant-form-item) {
    margin-bottom: 28px;
  }
  
  :deep(.ant-input-affix-wrapper),
  :deep(.ant-textarea) {
    padding: 12px 16px;
  }
  
  :deep(.ant-textarea) {
    min-height: 80px;
  }
  
  .register-button {
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
  
  .register-form-content {
    padding: 0 20px 16px 20px;
  }
  
  .form-footer {
    padding: 0 20px 16px 20px;
  }
  
  :deep(.ant-form-item) {
    margin-bottom: 18px;
  }
  
  :deep(.ant-input-affix-wrapper),
  :deep(.ant-textarea) {
    padding: 10px 14px;
  }
  
  :deep(.ant-textarea) {
    min-height: 70px;
  }
  
  .register-button {
    height: 44px;
    font-size: 14px;
  }
}

/* Tablet responsive */
@media (max-width: 768px) and (min-width: 481px) {
  .form-header {
    padding: 32px;
  }
  
  .register-form-content {
    padding: 0 32px 28px 32px;
  }
  
  .form-footer {
    padding: 0 32px 28px 32px;
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
  
  .register-form-content {
    padding: 0 48px 28px 48px;
  }
  
  .form-footer {
    padding: 0 48px 36px 48px;
  }
  
  .register-button {
    height: 56px;
    font-size: 17px;
  }
  
  :deep(.ant-input-affix-wrapper),
  :deep(.ant-textarea) {
    padding: 18px 24px;
  }
  
  :deep(.ant-input) {
    font-size: 17px;
  }
}
</style>