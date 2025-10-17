<script setup>
import ChatSidebar from './components/ChatSidebar.vue'
import ChatMain from './components/ChatMain.vue'
</script>

<template>
  <a-layout class="chat-app">
    <ChatSidebar />
    <ChatMain />
  </a-layout>
</template>

<style scoped>
.chat-app {
  height: 100vh;
  overflow: hidden;
}
</style>
