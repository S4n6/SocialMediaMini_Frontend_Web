import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketConfig,
  SocketConnectionState,
} from "@/types/socket";

export class SocketConnection {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private config: SocketConfig;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  // State callbacks
  private onStateChange?: (state: Partial<SocketConnectionState>) => void;
  private onConnect?: () => void;
  private onDisconnect?: (reason: string) => void;
  private onError?: (error: Error) => void;

  constructor(config: SocketConfig) {
    this.config = config;
  }

  // ===== CALLBACK REGISTRATION =====

  setCallbacks({
    onStateChange,
    onConnect,
    onDisconnect,
    onError,
  }: {
    onStateChange?: (state: Partial<SocketConnectionState>) => void;
    onConnect?: () => void;
    onDisconnect?: (reason: string) => void;
    onError?: (error: Error) => void;
  }): void {
    this.onStateChange = onStateChange;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    this.onError = onError;
  }

  // ===== CONNECTION MANAGEMENT =====

  connect(userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.onStateChange?.({ isConnecting: true, error: null });

      const socketOptions = {
        ...this.config.options,
        auth: userId ? { userId } : undefined,
        transports: ["websocket", "polling"] as unknown as string[],
      };

      this.socket = io(this.config.url, socketOptions);

      // Connection event handlers
      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket?.id);
        this.onStateChange?.({
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          error: null,
          reconnectAttempt: 0,
        });
        this.onConnect?.();
        this.startHeartbeat();
        resolve();
      });

      this.socket.on("disconnect", (reason: string) => {
        console.log("Socket disconnected:", reason);
        this.onStateChange?.({
          isConnected: false,
          isConnecting: false,
        });
        this.onDisconnect?.(reason);
        this.stopHeartbeat();

        if (reason === "io server disconnect") {
          // Manual disconnect, don't reconnect
          return;
        }

        this.handleReconnection();
      });

      this.socket.on("connect_error", (error: Error) => {
        console.error("Socket connection error:", error);
        this.onStateChange?.({
          isConnected: false,
          isConnecting: false,
          error: error.message,
        });
        this.onError?.(error);
        reject(error);
      });

      // Setup default handlers
      this.setupDefaultHandlers();
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.clearTimers();
    this.onStateChange?.({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      error: null,
      reconnectAttempt: 0,
    });
  }

  private handleReconnection(): void {
    const maxAttempts = this.config.options?.reconnectionAttempts ?? 5;
    const delay = this.config.options?.reconnectionDelay ?? 1000;

    // Get current reconnect attempt from state (would be managed by SocketStateManager)
    // For now, we'll use a simple counter approach
    let currentAttempt = 0;

    if (currentAttempt >= maxAttempts) {
      this.onStateChange?.({
        error: `Failed to reconnect after ${maxAttempts} attempts`,
        isReconnecting: false,
      });
      return;
    }

    this.onStateChange?.({
      isReconnecting: true,
      reconnectAttempt: currentAttempt + 1,
    });

    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnection attempt ${currentAttempt + 1}`);
      this.connect().catch(console.error);
    }, delay * Math.pow(2, currentAttempt)); // Exponential backoff
  }

  // ===== SOCKET ACCESS =====

  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected === true;
  }

  getSocketId(): string | null {
    return this.socket?.id ?? null;
  }

  // ===== PRIVATE METHODS =====

  private setupDefaultHandlers(): void {
    if (!this.socket) return;

    this.socket.on(
      "error",
      (error: { message: string; code?: string; data?: any }) => {
        console.error("Socket error:", error);
        this.onStateChange?.({ error: error.message });
      }
    );

    this.socket.on("reconnect", (attemptNumber: number) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      this.onStateChange?.({
        isReconnecting: false,
        reconnectAttempt: 0,
        error: null,
      });
    });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.onStateChange?.({ lastPing: Date.now() });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
  }

  // ===== CLEANUP =====

  destroy(): void {
    this.disconnect();
    this.clearTimers();
  }
}
