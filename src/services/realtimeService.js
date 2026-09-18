/**
 * MPL S4 Real-Time Auction Synchronization Service
 * Handles multi-device synchronization via WebSockets, BroadcastChannel, and HTTP fallback.
 */

class RealtimeAuctionService {
  constructor() {
    this.ws = null;
    this.status = 'DISCONNECTED'; // 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED'
    this.statusListeners = new Set();
    this.stateListeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 8000;
    this.pingInterval = null;
    this.broadcastChannel = null;

    // Initialize BroadcastChannel for instant same-device / multi-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('mpl_s4_auction_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'STATE_UPDATE' && event.data.payload) {
            this.notifyStateListeners(event.data.payload, 'broadcast');
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      // Connect to WebSocket server
      this.connect();

      // Listen for window online/offline events
      window.addEventListener('online', () => {
        console.log('Network online, reconnecting realtime service...');
        this.connect();
      });

      window.addEventListener('offline', () => {
        console.log('Network offline');
        this.setStatus('DISCONNECTED');
      });
    }
  }

  setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((listener) => {
        try {
          listener(newStatus);
        } catch (e) {
          console.error('Error in status listener:', e);
        }
      });
    }
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  onStateUpdate(callback) {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  notifyStateListeners(state, source = 'ws') {
    this.stateListeners.forEach((listener) => {
      try {
        listener(state, source);
      } catch (e) {
        console.error('Error in state listener:', e);
      }
    });
  }

  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/ws-auction`;
  }

  connect() {
    if (typeof window === 'undefined') return;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('RECONNECTING');

    try {
      const url = this.getWebSocketUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('🟢 Realtime WebSocket connected:', url);
        this.setStatus('CONNECTED');
        this.reconnectAttempts = 0;
        this.startHeartbeat();

        // Also fetch any missed state
        this.fetchLatestState();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INIT_STATE' || data.type === 'STATE_UPDATE') {
            if (data.payload) {
              this.notifyStateListeners(data.payload, 'ws');
            }
          }
        } catch (err) {
          console.error('Failed to parse incoming WS message:', err);
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
        this.ws?.close();
      };
    } catch (err) {
      console.warn('Failed to initialize WebSocket:', err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    this.setStatus('RECONNECTING');
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, 12000);
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Broadcast updated state from Admin to all connected devices
   * @param {Object} state - Authoritative auction state
   */
  sendState(state) {
    if (!state) return;

    // 1. Sync via BroadcastChannel to other tabs on the same device
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'STATE_UPDATE', payload: state });
      } catch (err) {
        console.warn('BroadcastChannel send error:', err);
      }
    }

    // 2. Sync via WebSocket to server and other devices
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'SYNC_STATE', payload: state }));
        return;
      } catch (err) {
        console.warn('WebSocket send error, falling back to HTTP:', err);
      }
    }

    // 3. Fallback to HTTP POST if WebSocket is disconnected
    this.sendStateHttp(state);
  }

  async sendStateHttp(state) {
    try {
      await fetch('/api/auction-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
    } catch (err) {
      console.error('HTTP state sync error:', err);
    }
  }

  async fetchLatestState() {
    try {
      const res = await fetch('/api/auction-state');
      if (res.ok) {
        const state = await res.json();
        if (state && Object.keys(state).length > 0) {
          this.notifyStateListeners(state, 'http');
        }
      }
    } catch (err) {
      // Silently ignore if offline
    }
  }
}

export const realtimeService = new RealtimeAuctionService();
export default realtimeService;
