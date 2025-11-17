const CHANNEL_NAME = 'quick_notes_realtime_v1';

/**
 * A lightweight realtime sync service using BroadcastChannel with localStorage fallback.
 * It publishes/receives events across tabs/windows for multi-tab sync.
 * Events:
 *  - note_created: { note }
 *  - note_updated: { note }
 *  - note_deleted: { id }
 *  - auth_changed: { user }
 */
class RealtimeService {
  constructor() {
    this._subscribers = new Set();
    this._useStorage = false;

    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        this._channel = new BroadcastChannel(CHANNEL_NAME);
        this._channel.onmessage = (e) => this._handleMessage(e.data);
      } else {
        this._useStorage = true;
        window.addEventListener('storage', this._onStorage.bind(this));
      }
    }
  }

  _onStorage(e) {
    if (!e) return;
    if (e.key !== CHANNEL_NAME || !e.newValue) return;
    try {
      const payload = JSON.parse(e.newValue);
      // Ignore self-origin marker by timestamp tolerance if needed
      this._handleMessage(payload);
    } catch {
      // ignore parsing errors
    }
  }

  _handleMessage(message) {
    if (!message || typeof message !== 'object') return;
    for (const cb of this._subscribers) {
      try {
        cb(message);
      } catch {
        // ignore subscriber errors to keep bus alive
      }
    }
  }

  // PUBLIC_INTERFACE
  subscribe(callback) {
    /** Subscribe to realtime events. Returns an unsubscribe function. */
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  // PUBLIC_INTERFACE
  publish(type, payload) {
    /** Publish an event of a specific type across tabs. */
    const msg = { type, payload, ts: Date.now() };
    if (this._useStorage) {
      // Use a unique value so storage event fires
      try {
        localStorage.setItem(CHANNEL_NAME, JSON.stringify(msg));
        // clean up to avoid clutter
        setTimeout(() => {
          try {
            localStorage.removeItem(CHANNEL_NAME);
          } catch {
            // ignore
          }
        }, 0);
      } catch {
        // ignore storage write failures
      }
    } else if (this._channel) {
      try {
        this._channel.postMessage(msg);
      } catch {
        // ignore channel issues
      }
    }
  }
}

export const realtimeService = new RealtimeService();
