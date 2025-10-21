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

    this.client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 1000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => {
        if (import.meta?.env?.VITE_DEBUG === 'true') console.log('[STOMP]', msg)
      },
      onConnect: () => this._emit('connected'),
      onStompError: (frame) => this._emit('error', frame),
      onWebSocketClose: () => this._emit('disconnected'),
    })

    this.client.activate()
  }

  disconnect() {
    if (!this.client) return
    try { this.client.deactivate() } catch (_) {}
    this.client = null
    this.subscriptions.clear()
  }

  subscribe(destination, cb) {
    if (!this.client?.connected) return null
    const sub = this.client.subscribe(destination, (message) => {
      const body = message.body ? JSON.parse(message.body) : null
      cb(body, message)
    })
    this.subscriptions.set(sub.id, sub)
    return sub.id
  }

  unsubscribe(id) {
    const sub = this.subscriptions.get(id)
    if (sub) { try { sub.unsubscribe() } catch (_) {} }
    this.subscriptions.delete(id)
  }

  send(destination, body) {
    if (!this.client?.connected) return
    const payload = typeof body === 'string' ? body : JSON.stringify(body)
    this.client.publish({ destination, body: payload })
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
