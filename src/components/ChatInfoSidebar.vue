<template>
  <div class="chat-info-sidebar" :class="{ 'visible': visible }">
    <!-- Backdrop -->
    <div class="sidebar-backdrop" @click="closeSidebar"></div>
    
    <!-- Sidebar Content -->
    <div class="sidebar-content">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="header-controls">
          <a-button type="text" class="menu-btn" @click="toggleMenu">
            <MenuOutlined />
          </a-button>
          
          <h2 class="sidebar-title">{{ chatInfo?.type === 'group' ? 'Group Info' : chatInfo?.type === 'channel' ? 'Channel Info' : 'Chat Info' }}</h2>
          
          <a-button type="text" class="close-btn" @click="closeSidebar">
            <CloseOutlined />
          </a-button>
        </div>
      </div>

      <!-- Chat Profile Section -->
      <div class="chat-profile-section">
        <div class="chat-avatar-container">
          <a-avatar 
            :size="80" 
            :src="chatInfo?.avatar"
            :style="{ backgroundColor: getAvatarColor(chatInfo?.id) }"
            class="chat-avatar"
          >
           