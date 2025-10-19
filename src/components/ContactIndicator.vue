<template>
  <div class="contact-indicator">
    <!-- Contact badge -->
    <a-tag v-if="isContact" :color="color" :size="size" class="contact-tag">
      <UserOutlined v-if="showIcon" />
      {{ label }}
    </a-tag>
    
    <!-- Favorite indicator -->
    <StarFilled 
      v-if="isFavorite && showFavorite" 
      class="favorite-icon" 
      :class="{ 'small': size === 'small' }"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { UserOutlined, StarFilled } from '@ant-design/icons-vue'

const props = defineProps({
  isContact: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: 'Contact'
  },
  color: {
    type: String,
    default: 'blue'
  },
  size: {
    type: String,
    default: 'small',
    validator: (value) => ['small', 'default'].includes(value)
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  showFavorite: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.contact-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.contact-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.favorite-icon {
  color: #faad14;
  font-size: 14px;
}

.favorite-icon.small {
  font-size: 12px;
}
</style>