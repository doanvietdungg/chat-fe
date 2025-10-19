import { ref, onMounted, onUnmounted } from 'vue'

export function useKeyboardNavigation(items, options = {}) {
  const {
    onSelect = () => {},
    onEscape = () => {},
    onEnter = () => {},
    loop = true,
    initialIndex = -1
  } = options

  const selectedIndex = ref(initialIndex)

  const selectNext = () => {
    if (!items.value || items.value.length === 0) return
    
    if (selectedIndex.value < items.value.length - 1) {
      selectedIndex.value++
    } else if (loop) {
      selectedIndex.value = 0
    }
  }

  const selectPrevious = () => {
    if (!items.value || items.value.length === 0) return
    
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    } else if (loop) {
      selectedIndex.value = items.value.length - 1
    }
  }

  const selectFirst = () => {
    if (items.value && items.value.length > 0) {
      selectedIndex.value = 0
    }
  }

  const selectLast = () => {
    if (items.value && items.value.length > 0) {
      selectedIndex.value = items.value.length - 1
    }
  }

  const selectItem = (index) => {
    if (items.value && index >= 0 && index < items.value.length) {
      selectedIndex.value = index
    }
  }

  const getCurrentItem = () => {
    if (items.value && selectedIndex.value >= 0 && selectedIndex.value < items.value.length) {
      return items.value[selectedIndex.value]
    }
    return null
  }

  const reset = () => {
    selectedIndex.value = initialIndex
  }

  const handleKeydown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        selectNext()
        break
      case 'ArrowUp':
        event.preventDefault()
        selectPrevious()
        break
      case 'Home':
        event.preventDefault()
        selectFirst()
        break
      case 'End':
        event.preventDefault()
        selectLast()
        break
      case 'Enter':
        event.preventDefault()
        const currentItem = getCurrentItem()
        if (currentItem) {
          onSelect(currentItem, selectedIndex.value)
        }
        onEnter(currentItem, selectedIndex.value)
        break
      case 'Escape':
        event.preventDefault()
        onEscape()
        break
    }
  }

  const bindKeyboard = () => {
    document.addEventListener('keydown', handleKeydown)
  }

  const unbindKeyboard = () => {
    document.removeEventListener('keydown', handleKeydown)
  }

  return {
    selectedIndex,
    selectNext,
    selectPrevious,
    selectFirst,
    selectLast,
    selectItem,
    getCurrentItem,
    reset,
    handleKeydown,
    bindKeyboard,
    unbindKeyboard
  }
}