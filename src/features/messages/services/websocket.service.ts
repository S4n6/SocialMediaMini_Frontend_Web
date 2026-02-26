import { io, Socket } from 'socket.io-client';
import {
  ApiMessage,
  MessageEvent,
  TypingEvent,
  OnlineStatusEvent,
  ReactionEvent,
} from '../types/api.types';
import {
  wsErrorHandler,
  WebSocketError,
} from '../utils/websocket-error-handler';
import {
  networkMonitor,
  shouldUseFallbackMode,
} from '../utils/network-monitor';

export interface WebSocketConfig {
  url: string;
  token?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionAttempts?: number;
}

export interface WebSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: WebSocketError) => void;
  onReconnect?: (attemptNumber: number) => void;
  onReconnectError?: (error: WebSocketError) => void;

  // Message events
  onMessageReceived?: (message: ApiMessage) => void;
  onMessageDelivered?: (messageId: string, conversationId: string) => void;
  onMessageRead?: (
    messageId: string,
    conversationId: string,
    userId: string,
  ) => void;
  onMessageEdited?: (message: ApiMessage) => void;
  onMessageDeleted?: (messageId: string, conversationId: string) => void;

  // Typing events
  onTypingStart?: (event: TypingEvent) => void;
  onTypingStop?: (event: TypingEvent) => void;

  // Online status events
  onUserOnline?: (event: OnlineStatusEvent) => void;
  onUserOffline?: (event: OnlineStatusEvent) => void;

  // Reaction events
  onReactionAdded?: (event: ReactionEvent) => void;
  onReactionRemoved?: (event: ReactionEvent) => void;

  // Conversation events
  onConversationUpdated?: (conversationId: string) => void;
  onNewConversation?: (conversationId: string) => void;

  // Network status events
  onNetworkChange?: (status: 'online' | 'offline') => void;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private callbacks: WebSocketCallbacks = {};
  private connectionStatus:
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'error' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId: string | null = null;
  private fallbackMode = false;
  private networkStatusListener?: () => void;

  constructor(config: WebSocketConfig) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      ...config,
    };
    this.maxReconnectAttempts = this.config.reconnectionAttempts || 5;

    // Initialize network monitoring
    this.initializeNetworkMonitoring();
  }

  private initializeNetworkMonitoring(): void {
    // Monitor network status changes
    this.networkStatusListener = networkMonitor.addListener((status) => {
      if (!status.isOnline) {
        console.log('🔴 Network offline - enabling fallback mode');
        this.fallbackMode = true;
        this.callbacks.onNetworkChange?.('offline');
      } else {
        console.log('🟢 Network online - checking WebSocket connection');
        this.fallbackMode = shouldUseFallbackMode(status);
        this.callbacks.onNetworkChange?.('online');

        // Try to reconnect if we're not connected
        if (this.connectionStatus === 'disconnected' && !this.fallbackMode) {
          this.connect(this.userId || undefined).catch((error) => {
            console.error('Auto-reconnection failed:', error);
          });
        }
      }
    });
  }

  // Check if we should use fallback mode (HTTP-only)
  public shouldUseFallbackMode(): boolean {
    return (
      this.fallbackMode ||
      !networkMonitor.isOnline() ||
      wsErrorHandler.shouldUseFallbackMode()
    );
  }

  // Connection management
  connect(userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.userId = userId || null;
      this.connectionStatus = 'connecting';

      const socketOptions: any = {
        autoConnect: false,
        reconnection: this.config.reconnection,
        reconnectionDelay: this.config.reconnectionDelay,
        reconnectionAttempts: this.config.reconnectionAttempts,
      };

      // Add authentication if token is provided
      if (this.config.token) {
        socketOptions.auth = {
          token: this.config.token,
        };
      }

      // Add user ID to connection
      if (this.userId) {
        socketOptions.query = {
          userId: this.userId,
        };
      }

      this.socket = io(this.config.url, socketOptions);

      this.setupEventListeners();

      this.socket.connect();

      // Handle connection timeout
      const timeout = setTimeout(() => {
        if (this.connectionStatus !== 'connected') {
          this.connectionStatus = 'error';
          reject(new Error('Connection timeout'));
        }
      }, 10000); // 10 second timeout

      this.socket.once('connect', () => {
        clearTimeout(timeout);
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.callbacks.onConnect?.();
        resolve();
      });

      this.socket.once('connect_error', (error) => {
        clearTimeout(timeout);
        this.connectionStatus = 'error';
        const wsError = wsErrorHandler.handleError(error, 'connection', () =>
          this.connect(userId),
        );
        this.callbacks.onError?.(wsError);
        reject(wsError);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = 'disconnected';
    }

    // Clean up network listener
    if (this.networkStatusListener) {
      this.networkStatusListener();
      this.networkStatusListener = undefined;
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔗 WebSocket connected');
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.connectionStatus = 'disconnected';
      this.callbacks.onDisconnect?.(reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.connectionStatus = 'error';
      const wsError = wsErrorHandler.handleError(error, 'connection error');
      this.callbacks.onError?.(wsError);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
      this.connectionStatus = 'connected';
      this.callbacks.onReconnect?.(attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔄❌ WebSocket reconnection error:', error);
      this.reconnectAttempts++;
      const wsError = wsErrorHandler.handleError(error, 'reconnection error');
      this.callbacks.onReconnectError?.(wsError);
    });

    // Message events
    this.socket.on('message:received', (message: ApiMessage) => {
      console.log('📨 Message received:', message);
      this.callbacks.onMessageReceived?.(message);
    });

    this.socket.on(
      'message:delivered',
      (data: { messageId: string; conversationId: string }) => {
        console.log('✅ Message delivered:', data);
        this.callbacks.onMessageDelivered?.(
          data.messageId,
          data.conversationId,
        );
      },
    );

    this.socket.on(
      'message:read',
      (data: { messageId: string; conversationId: string; userId: string }) => {
        console.log('👁️ Message read:', data);
        this.callbacks.onMessageRead?.(
          data.messageId,
          data.conversationId,
          data.userId,
        );
      },
    );

    this.socket.on('message:edited', (message: ApiMessage) => {
      console.log('✏️ Message edited:', message);
      this.callbacks.onMessageEdited?.(message);
    });

    this.socket.on(
      'message:deleted',
      (data: { messageId: string; conversationId: string }) => {
        console.log('🗑️ Message deleted:', data);
        this.callbacks.onMessageDeleted?.(data.messageId, data.conversationId);
      },
    );

    // Typing events
    this.socket.on('typing:start', (event: TypingEvent) => {
      console.log('⌨️ Typing started:', event);
      this.callbacks.onTypingStart?.(event);
    });

    this.socket.on('typing:stop', (event: TypingEvent) => {
      console.log('⌨️ Typing stopped:', event);
      this.callbacks.onTypingStop?.(event);
    });

    // Online status events
    this.socket.on('user:online', (event: OnlineStatusEvent) => {
      console.log('🟢 User online:', event);
      this.callbacks.onUserOnline?.(event);
    });

    this.socket.on('user:offline', (event: OnlineStatusEvent) => {
      console.log('🔴 User offline:', event);
      this.callbacks.onUserOffline?.(event);
    });

    // Reaction events
    this.socket.on('reaction:added', (event: ReactionEvent) => {
      console.log('😊 Reaction added:', event);
      this.callbacks.onReactionAdded?.(event);
    });

    this.socket.on('reaction:removed', (event: ReactionEvent) => {
      console.log('😊❌ Reaction removed:', event);
      this.callbacks.onReactionRemoved?.(event);
    });

    // Conversation events
    this.socket.on(
      'conversation:updated',
      (data: { conversationId: string }) => {
        console.log('💬 Conversation updated:', data);
        this.callbacks.onConversationUpdated?.(data.conversationId);
      },
    );

    this.socket.on('conversation:new', (data: { conversationId: string }) => {
      console.log('💬✨ New conversation:', data);
      this.callbacks.onNewConversation?.(data.conversationId);
    });
  }

  // Event emission methods
  joinConversation(conversationId: string): void {
    if (this.isConnected()) {
      this.socket?.emit('conversation:join', { conversationId });
      console.log('🏠 Joined conversation:', conversationId);
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.isConnected()) {
      this.socket?.emit('conversation:leave', { conversationId });
      console.log('🚪 Left conversation:', conversationId);
    }
  }

  sendMessage(message: Omit<ApiMessage, 'id' | 'sentAt' | 'reactions'>): void {
    if (this.isConnected()) {
      this.socket?.emit('message:send', message);
      console.log('📤 Sending message:', message);
    }
  }

  markMessageAsRead(messageId: string, conversationId: string): void {
    if (this.isConnected()) {
      this.socket?.emit('message:read', { messageId, conversationId });
      console.log('👁️ Marking message as read:', { messageId, conversationId });
    }
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (this.isConnected()) {
      const event = isTyping ? 'typing:start' : 'typing:stop';
      this.socket?.emit(event, {
        conversationId,
        userId: this.userId,
        isTyping,
      });
      console.log(
        `⌨️ ${isTyping ? 'Started' : 'Stopped'} typing in:`,
        conversationId,
      );
    }
  }

  addReaction(conversationId: string, messageId: string, emoji: string): void {
    if (this.isConnected()) {
      this.socket?.emit('reaction:add', { conversationId, messageId, emoji });
      console.log('😊 Adding reaction:', { conversationId, messageId, emoji });
    }
  }

  removeReaction(
    conversationId: string,
    messageId: string,
    emoji: string,
  ): void {
    if (this.isConnected()) {
      this.socket?.emit('reaction:remove', {
        conversationId,
        messageId,
        emoji,
      });
      console.log('😊❌ Removing reaction:', {
        conversationId,
        messageId,
        emoji,
      });
    }
  }

  updateOnlineStatus(isOnline: boolean): void {
    if (this.isConnected()) {
      this.socket?.emit('user:status', {
        isOnline,
        lastSeen: new Date().toISOString(),
      });
      console.log('🔄 Updated online status:', isOnline);
    }
  }

  // Callback management
  setCallbacks(callbacks: WebSocketCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected === true;
  }

  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    return this.connectionStatus;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  // Manual reconnection
  reconnect(): Promise<void> {
    if (this.socket && !this.socket.connected) {
      return new Promise((resolve, reject) => {
        this.socket?.connect();

        const timeout = setTimeout(() => {
          reject(new Error('Reconnection timeout'));
        }, 5000);

        this.socket?.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket?.once('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    }
    return Promise.resolve();
  }

  // Get error logs for debugging
  getErrorLog() {
    return wsErrorHandler.getErrorLog();
  }

  // Get network status
  getNetworkStatus() {
    return networkMonitor.getCurrentStatus();
  }

  // Cleanup
  destroy(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    // Clean up network listener
    if (this.networkStatusListener) {
      this.networkStatusListener();
      this.networkStatusListener = undefined;
    }

    this.callbacks = {};
    this.connectionStatus = 'disconnected';
  }
}

// Export singleton instance
let webSocketService: WebSocketService | null = null;

export const createWebSocketService = (
  config: WebSocketConfig,
): WebSocketService => {
  if (webSocketService) {
    webSocketService.destroy();
  }
  webSocketService = new WebSocketService(config);
  return webSocketService;
};

export const getWebSocketService = (): WebSocketService | null => {
  return webSocketService;
};
