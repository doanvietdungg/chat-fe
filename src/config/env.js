// Environment configuration
export const config = {
  // API Base URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // API Timeout
  API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 10000,
  
  // App Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  
  // Debug mode
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false
}