<template>
  <div class="theme-toggle">
    <a-button 
      type="text" 
      @click="toggleTheme"
      class="theme-btn"
      :title="isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'"
    >
      <template #icon>
        <transition name="theme-icon" mode="out-in">
          <span v-if="isDark" key="sun" class="theme-icon">☀️</span>
          <span v-else key="moon" class="theme-icon">🌙</span>
        </transition>
      </template>
    </a-button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
// Using emoji icons instead of @ant-design/icons-vue

const isDark = ref(false)

const emit = defineEmits(['theme-changed'])

// Load theme from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('chat-theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // Check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
})

// Watch for theme changes
watch(isDark, (newValue) => {
  applyTheme()
  localStorage.setItem('chat-theme', newValue ? 'dark' : 'light')
  emit('theme-changed', newValue ? 'dark' : 'light')
})

function toggleTheme() {
  isDark.value = !isDark.value
}

function applyTheme() {
  const root = document.documentElement
  
  if (isDark.value) {
    // Dark theme variables
    root.style.setProperty('--bg-color', '#1a1a1a')
    root.style.setProperty('--chat-bg', '#2d2d2d')
    root.style.setProperty('--sidebar-bg', '#252525')
    root.style.setProperty('--text-primary', '#ffffff')
    root.style.setProperty('--text-secondary', '#b3b3b3')
    root.style.setProperty('--border-color', '#404040')
    root.style.setProperty('--message-bg', '#404040')
    root.style.setProperty('--own-message-bg', '#1890ff')
    root.style.setProperty('--hover-bg', '#333333')
    root.style.setProperty('--input-bg', '#333333')
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)')
    
    // Add dark class to body
    document.body.classList.add('dark-theme')
    document.body.classList.remove('light-theme')
  } else {
    // Light theme variables
    root.style.setProperty('--bg-color', '#ffffff')
    root.style.setProperty('--chat-bg', '#f5f5f5')
    root.style.setProperty('--sidebar-bg', '#ffffff')
    root.style.setProperty('--text-primary', '#262626')
    root.style.setProperty('--text-secondary', '#8c8c8c')
    root.style.setProperty('--border-color', '#d9d9d9')
    root.style.setProperty('--message-bg', '#f0f0f0')
    root.style.setProperty('--own-message-bg', '#1890ff')
    root.style.setProperty('--hover-bg', '#f5f5f5')
    root.style.setProperty('--input-bg', '#ffffff')
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)')
    
    // Add light class to body
    document.body.classList.add('light-theme')
    document.body.classList.remove('dark-theme')
  }
}

// Listen for system theme changes
onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('chat-theme')) {
      isDark.value = e.matches
    }
  })
})
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
}

.theme-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.theme-btn:hover {
  background: var(--hover-bg, #f5f5f5);
  transform: scale(1.1);
}

.theme-icon {
  font-size: 18px;
  color: var(--text-primary, #262626);
  transition: all 0.3s ease;
}

/* Theme icon transitions */
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.3s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-180deg) scale(0.5);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(180deg) scale(0.5);
}

.theme-icon-enter-to,
.theme-icon-leave-from {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

/* Ripple effect */
.theme-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(24, 144, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.theme-btn:active::before {
  width: 40px;
  height: 40px;
}

/* Dark theme specific styles */
:global(.dark-theme) .theme-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

:global(.dark-theme) .theme-icon {
  color: #ffffff;
}

/* Animation for theme change */
.theme-btn {
  animation: themeChange 0.5s ease-in-out;
}

@keyframes themeChange {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .theme-btn {
    width: 36px;
    height: 36px;
  }
  
  .theme-icon {
    font-size: 16px;
  }
}

/* Accessibility */
.theme-btn:focus {
  outline: 2px solid #1890ff;
  outline-offset: 2px;
}

.theme-btn:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .theme-btn {
    border: 2px solid var(--text-primary);
  }
  
  .theme-icon {
    font-weight: bold;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .theme-btn,
  .theme-icon,
  .theme-icon-enter-active,
  .theme-icon-leave-active {
    transition: none;
  }
  
  .theme-btn {
    animation: none;
  }
}
</style>

<style>
/* Global theme styles */
:root {
  --transition-theme: all 0.3s ease;
}

* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Dark theme global styles */
.dark-theme {
  background-color: var(--bg-color);
  color: var(--text-primary);
}

.dark-theme .ant-layout {
  background: var(--bg-color);
}

.dark-theme .ant-layout-sider {
  background: var(--sidebar-bg);
}

.dark-theme .ant-menu {
  background: var(--sidebar-bg);
  color: var(--text-primary);
}

.dark-theme .ant-menu-item {
  color: var(--text-primary);
}

.dark-theme .ant-menu-item:hover {
  background: var(--hover-bg);
}

.dark-theme .ant-input {
  background: var(--input-bg);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark-theme .ant-btn {
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark-theme .ant-btn:hover {
  background: var(--hover-bg);
}

/* Light theme global styles */
.light-theme {
  background-color: var(--bg-color);
  color: var(--text-primary);
}

/* Smooth transitions for theme switching */
.theme-transition * {
  transition: var(--transition-theme);
}
</style>