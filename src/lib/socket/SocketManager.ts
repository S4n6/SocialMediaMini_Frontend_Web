import type { SocketConfig, SocketConnectionState } from "@/types/socket";
import { SocketConnection } from "./core/SocketConnection";
import { SocketEventManager } from "./core/SocketEventManager";
import { SocketStateManager } from "./core/SocketStateManager";
import { PostSocketService } from "./services/PostSocketService";
import { ProfileSocketService } from "./services/ProfileSocketService";
import { MessageSocketService } from "./services/MessageSocketService";
import { NotificationSocketService } from "./services/NotificationSocketService";

export class SocketManager {
  private connection: SocketConnection;
  private eventManager: SocketEventManager;
  private stateManager: SocketStateManager;

  // Feature services
  public readonly posts: PostSocketService;
  public readonly profile: ProfileSocketService;
  public readonly messages: MessageSocketService;
  public readonly notifications: NotificationSocketService;

  constructor(config: SocketConfig) {
    // Initialize core modules
    this.connection = new SocketConnection(config);
    this.eventManager = new SocketEventManager();
    this.stateManager = new SocketStateManager();

    // Initialize feature services
    this.posts = new PostSocketService(this.eventManager);
    this.profile = new ProfileSocketService(this.eventManager);
    this.messages = new MessageSocketService(this.eventManager);
    this.notifications = new NotificationSocketService(this.eventManager);

    // Setup inter-module communication
    this.setupModuleIntegration();
  }

  // ===== CONNECTION MANAGEMENT =====

  connect(userId?: string): Promise<void> {
    return this.connection.connect(userId);
  }

  disconnect(): void {
    this.connection.disconnect();
  }

  // ===== STATE ACCESS =====

  getState(): SocketConnectionState {
    return this.stateManager.getState();
  }

  onStateChange(listener: (state: SocketConnectionState) => void): () => void {
    return this.stateManager.onStateChange(listener);
  }

  // ===== CONNECTION STATUS =====

  isConnected(): boolean {
    return this.stateManager.isConnected();
  }

  getSocketId(): string | null {
    return this.connection.getSocketId();
  }

  // ===== DIRECT EVENT ACCESS (for advanced usage) =====

  on(event: any, handler: any) {
    return this.eventManager.on(event, handler);
  }

  off(event: any, handler?: any) {
    return this.eventManager.off(event, handler);
  }

  emit(event: any, ...args: any[]) {
    return this.eventManager.emit(event, ...args);
  }

  // ===== PRIVATE METHODS =====

  private setupModuleIntegration(): void {
    // Setup connection callbacks to update state and event manager
    this.connection.setCallbacks({
      onStateChange: (stateUpdate) => {
        this.stateManager.updateState(stateUpdate);
      },
      onConnect: () => {
        const socket = this.connection.getSocket();
        this.eventManager.setSocket(socket);
        this.stateManager.setConnected();
      },
      onDisconnect: (reason) => {
        this.stateManager.setDisconnected();
        console.log("Socket disconnected:", reason);
      },
      onError: (error) => {
        this.stateManager.setError(error.message);
        console.error("Socket error:", error);
      },
    });
  }

  // ===== CLEANUP =====

  destroy(): void {
    // Cleanup all services
    this.posts.removeAllListeners();
    this.profile.removeAllListeners();
    this.messages.removeAllListeners();
    this.notifications.removeAllListeners();

    // Cleanup core modules
    this.connection.destroy();
    this.eventManager.destroy();
    this.stateManager.destroy();
  }
}

// ===== SINGLETON PATTERN =====

let socketManager: SocketManager | null = null;

export const createSocketManager = (config: SocketConfig): SocketManager => {
  if (socketManager) {
    socketManager.destroy();
  }

  socketManager = new SocketManager(config);
  return socketManager;
};

export const getSocketManager = (): SocketManager | null => {
  return socketManager;
};
