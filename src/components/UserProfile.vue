<template>
  <a-modal
    v-model:open="visible"
    title="Thông tin tài khoản"
    width="600px"
    :footer="null"
    class="user-profile-modal"
  >
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-section">
          <a-avatar :size="80" :style="{ backgroundColor: getAvatarColor(user?.id) }">
            {{ userInitials }}
          </a-avatar>
          <a-button type="text" size="small" class="change-avatar-btn">
            <CameraOutlined />
            Đổi ảnh
          </a-button>
        </div>
        
        <div class="user-basic-info">
          <h3 class="user-name">{{ user?.name }}</h3>
          <p class="user-username">@{{ user?.username }}</p>
          <p class="user-email">{{ user?.email }}</p>
        </div>
      </div>

      <!-- Profile Tabs -->
      <a-tabs v-model:activeKey="activeTab" class="profile-tabs">
        <a-tab-pane key="info" tab="Thông tin cá nhân">
          <div class="tab-content">
            <a-form
              :model="profileForm"
              :rules="profileRules"
              layout="vertical"
              @finish="handleUpdateProfile"
            >
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="Họ và tên" name="name">
                    <a-input v-model:value="profileForm.name" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="Username" name="username">
                    <a-input v-model:value="profileForm.username" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="Email" name="email">
                    <a-input v-model:value="profileForm.email" disabled />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="Số điện thoại" name="phone">
                    <a-input v-model:value="profileForm.phone" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="Giới thiệu bản thân" name="bio">
                <a-textarea 
                  v-model:value="profileForm.bio" 
                  :rows="4"
                  placeholder="Viết vài dòng về bản thân..."
                />
              </a-form-item>

              <a-form-item>
                <a-button 
                  type="primary" 
                  html-type="submit"
                  :loading="isUpdating"
                >
                  Cập nhật thông tin
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <a-tab-pane key="security" tab="Bảo mật">
          <div class="tab-content">
            <a-form
              :model="passwordForm"
              :rules="passwordRules"
              layout="vertical"
              @finish="handleChangePassword"
            >
              <a-form-item label="Mật khẩu hiện tại" name="currentPassword">
                <a-input-password v-model:value="passwordForm.currentPassword" />
              </a-form-item>

              <a-form-item label="Mật khẩu mới" name="newPassword">
                <a-input-password v-model:value="passwordForm.newPassword" />
              </a-form-item>

              <a-form-item label="Xác nhận mật khẩu mới" name="confirmPassword">
                <a-input-password v-model:value="passwordForm.confirmPassword" />
              </a-form-item>

              <a-form-item>
                <a-button 
                  type="primary" 
                  html-type="submit"
                  :loading="isChangingPassword"
                >
                  Đổi mật khẩu
                </a-button>
              </a-form-item>
            </a-form>

            <a-divider />

            <div class="security-info">
              <h4>Thông tin bảo mật</h4>
              <div class="info-item">
                <span class="info-label">Tài khoản được tạo:</span>
                <span class="info-value">{{ formatDate(user?.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Đăng nhập lần cuối:</span>
                <span class="info-value">Hôm nay</span>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="settings" tab="Cài đặt">
          <div class="tab-content">
            <div class="settings-section">
              <h4>Thông báo</h4>
              <a-switch v-model:checked="settings.notifications" />
              <span class="setting-label">Nhận thông báo tin nhắn mới</span>
            </div>

            <div class="settings-section">
              <h4>Giao diện</h4>
              <a-radio-group v-model:value="settings.theme">
                <a-radio value="light">Sáng</a-radio>
                <a-radio value="dark">Tối</a-radio>
                <a-radio value="auto">Tự động</a-radio>
              </a-radio-group>
            </div>

            <div class="settings-section">
              <h4>Ngôn ngữ</h4>
              <a-select v-model:value="settings.language" style="width: 200px">
                <a-select-option value="vi">Tiếng Việt</a-select-option>
                <a-select-option value="en">English</a-select-option>
              </a-select>
            </div>

            <a-divider />

            <div class="danger-zone">
              <h4 class="danger-title">Vùng nguy hiểm</h4>
              <a-button danger @click="handleLogout">
                <LogoutOutlined />
                Đăng xuất
              </a-button>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { 
  CameraOutlined, 
  LogoutOutlined 
} from '@ant-design/icons-vue'
import { useAuthStore } from '../store/auth.js'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'logout'])

const authStore = useAuthStore()
const activeTab = ref('info')
const isUpdating = ref(false)
const isChangingPassword = ref(false)

const visible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const user = computed(() => authStore.currentUser)
const userInitials = computed(() => authStore.userInitials)

// Profile form
const profileForm = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  bio: ''
})

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Settings
const settings = reactive({
  notifications: true,
  theme: 'light',
  language: 'vi'
})

// Rules
const profileRules = {
  name: [
    { required: true, message: 'Vui lòng nhập họ và tên!' }
  ],
  username: [
    { required: true, message: 'Vui lòng nhập username!' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
  ],
  newPassword: [
    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
  ],
  confirmPassword: [
    { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
    {
      validator: (_, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('Mật khẩu xác nhận không khớp!')
        }
        return Promise.resolve()
      }
    }
  ]
}

// Watch user data and populate form
watch(user, (newUser) => {
  if (newUser) {
    profileForm.name = newUser.name || ''
    profileForm.username = newUser.username || ''
    profileForm.email = newUser.email || ''
    profileForm.phone = newUser.phone || ''
    profileForm.bio = newUser.bio || ''
  }
}, { immediate: true })

// Methods
const handleUpdateProfile = async () => {
  isUpdating.value = true
  
  try {
    await authStore.updateProfile({
      name: profileForm.name,
      username: profileForm.username,
      phone: profileForm.phone,
      bio: profileForm.bio
    })
    message.success('Cập nhật thông tin thành công!')
  } catch (error) {
    message.error(error.message || 'Cập nhật thất bại!')
  } finally {
    isUpdating.value = false
  }
}

const handleChangePassword = async () => {
  isChangingPassword.value = true
  
  try {
    await authStore.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    )
    message.success('Đổi mật khẩu thành công!')
    
    // Clear form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    message.error(error.message || 'Đổi mật khẩu thất bại!')
  } finally {
    isChangingPassword.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  visible.value = false
  emit('logout')
  message.success('Đăng xuất thành công!')
}

const getAvatarColor = (userId) => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
  if (!userId) return colors[0]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const formatDate = (dateString) => {
  if (!dateString) return 'Không xác định'
  return new Date(dateString).toLocaleDateString('vi-VN')
}
</script>

<style scoped>
.profile-container {
  padding: 0;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.avatar-section {
  text-align: center;
}

.change-avatar-btn {
  margin-top: 8px;
  font-size: 12px;
}

.user-basic-info {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #262626;
}

.user-username {
  color: #8c8c8c;
  margin: 0 0 4px 0;
  font-size: 16px;
}

.user-email {
  color: #595959;
  margin: 0;
  font-size: 14px;
}

.profile-tabs {
  margin-top: 0;
}

.tab-content {
  padding: 16px 0;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section h4 {
  margin-bottom: 12px;
  color: #262626;
}

.setting-label {
  margin-left: 12px;
  color: #595959;
}

.security-info {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

.security-info h4 {
  margin-bottom: 16px;
  color: #262626;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-label {
  color: #8c8c8c;
}

.info-value {
  color: #262626;
  font-weight: 500;
}

.danger-zone {
  background: #fff2f0;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ffccc7;
}

.danger-title {
  color: #cf1322;
  margin-bottom: 12px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .user-basic-info {
    text-align: center;
  }
}
</style>