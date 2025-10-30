import '../polyfills/global'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

class StompService {
  constructor() {
    this.client = null
    this.subscriptions = new Map()
    this.listeners = new Map()
  }

  connect() {
    if (this.client?.active) return
    const url = (import.meta?.env?.VITE_WS_URL) || 'http://localhost:8080/ws'
    const token = localStorage.getItem('auth_token')

    this.client = new Client({
      webSocketFactory: () => new SockJS(url),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 1000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => {
        if (import.meta?.env?.VITE_DEBUG === 'true') console.log('[STOMP]', msg)
        // Always log incoming messages for debugging
        if (msg.includes('MESSAGE')) {
          console.log('🔍 [STOMP DEBUG] Incoming message:', msg)
        }
      },
      onConnect: () => this._emit('connected'),
      onStompError: (frame) => this._emit('error', frame),
      onWebSocketClose: () => this._emit('disconnected'),
    })

    this.client.activate()
  }

  disconnect() {
    if (!this.client) return
    try { this.client.deactivate() } catch (_) { }
    this.client = null
    this.subscriptions.clear()
  }

  subscribe(destination, cb) {
    if (!this.client?.connected) {
      console.log('❌ STOMP client not connected, cannot subscribe to:', destination)
      return null
    }

    console.log('📡 STOMP subscribing to:', destination)

    const sub = this.client.subscribe(destination, (message) => {
      console.log('📨 STOMP received raw message on', destination)
      console.log('📨 Message headers:', message.headers)
      console.log('📨 Message body (raw):', message.body)
      console.log('📨 Message body type:', typeof message.body)
      console.log('📨 Message body length:', message.body?.length)
      
      let body = null
      try {
        body = message.body ? JSON.parse(message.body) : null
        console.log('📨 Parsed body:', body)
      } catch (error) {
        console.error('❌ Failed to parse message body:', error)
        console.log('❌ Raw body that failed to parse:', message.body)
      }
      
      cb(body, message)
    })

    this.subscriptions.set(sub.id, sub)
    console.log('✅ STOMP subscription created with ID:', sub.id)
    return sub.id
  }

  unsubscribe(id) {
    const sub = this.subscriptions.get(id)
    if (sub) { try { sub.unsubscribe() } catch (_) { } }
    this.subscriptions.delete(id)
  }

  send(destination, body) {
    if (!this.client?.connected) return
    const payload = typeof body === 'string' ? body : JSON.stringify(body)
    const token = localStorage.getItem('auth_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    this.client.publish({ destination, body: payload, headers })
  }

  on(event, cb) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event).push(cb)
  }
  _emit(event, data) {
    (this.listeners.get(event) || []).forEach(fn => fn(data))
  }
}

export const stompService = new StompService()
