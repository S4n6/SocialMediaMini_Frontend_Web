/**
 * Cross-tab authentication synchronization using BroadcastChannel.
 *
 * `CustomEvent` only fires within the current tab. This module ensures
 * login / logout / token-refresh events propagate to every open tab.
 */

const CHANNEL_NAME = 'auth-sync-channel';

export type AuthSyncMessage =
  | { action: 'login'; userId?: string }
  | { action: 'logout' }
  | { action: 'token-refresh' };

class AuthSyncBroadcast {
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<(msg: AuthSyncMessage) => void>();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<AuthSyncMessage>) => {
        this.listeners.forEach((cb) => cb(event.data));
      };
    }
  }

  /** Send a message to OTHER tabs and emit a local CustomEvent for same-tab listeners. */
  send(message: AuthSyncMessage): void {
    // Notify other tabs
    this.channel?.postMessage(message);

    // Also fire a same-tab CustomEvent so existing listeners still work
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-sync', { detail: message }));
    }
  }

  /** Subscribe to messages from other tabs (not same-tab). */
  onMessage(callback: (msg: AuthSyncMessage) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  destroy(): void {
    this.channel?.close();
    this.listeners.clear();
  }
}

export const authSyncBroadcast = new AuthSyncBroadcast();
