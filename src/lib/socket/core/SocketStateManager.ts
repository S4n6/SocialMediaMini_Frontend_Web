import type { SocketConnectionState } from "@/types/socket";

export class SocketStateManager {
  private state: SocketConnectionState = {
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    error: null,
    reconnectAttempt: 0,
  };

  private stateListeners: Set<(state: SocketConnectionState) => void> =
    new Set();

  constructor() {}

  // ===== STATE MANAGEMENT =====

  getState(): SocketConnectionState {
    return { ...this.state };
  }

  updateState(updates: Partial<SocketConnectionState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // Notify listeners if state actually changed
    if (this.hasStateChanged(previousState, this.state)) {
      this.notifyListeners();
    }
  }

  resetState(): void {
    this.updateState({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      error: null,
      reconnectAttempt: 0,
      lastPing: undefined,
    });
  }

  // ===== STATE LISTENERS =====

  onStateChange(listener: (state: SocketConnectionState) => void): () => void {
    this.stateListeners.add(listener);

    // Return unsubscribe function
    return () => this.stateListeners.delete(listener);
  }

  removeStateListener(listener: (state: SocketConnectionState) => void): void {
    this.stateListeners.delete(listener);
  }

  removeAllStateListeners(): void {
    this.stateListeners.clear();
  }

  // ===== COMPUTED STATE =====

  isConnected(): boolean {
    return this.state.isConnected;
  }

  isConnecting(): boolean {
    return this.state.isConnecting;
  }

  isReconnecting(): boolean {
    return this.state.isReconnecting;
  }

  hasError(): boolean {
    return this.state.error !== null;
  }

  getError(): string | null {
    return this.state.error;
  }

  getReconnectAttempt(): number {
    return this.state.reconnectAttempt;
  }

  getLastPing(): number | undefined {
    return this.state.lastPing;
  }

  // ===== CONNECTION STATE HELPERS =====

  setConnecting(): void {
    this.updateState({
      isConnecting: true,
      isConnected: false,
      error: null,
    });
  }

  setConnected(): void {
    this.updateState({
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      error: null,
      reconnectAttempt: 0,
    });
  }

  setDisconnected(): void {
    this.updateState({
      isConnected: false,
      isConnecting: false,
    });
  }

  setReconnecting(attempt: number): void {
    this.updateState({
      isReconnecting: true,
      reconnectAttempt: attempt,
    });
  }

  setError(error: string): void {
    this.updateState({
      error,
      isConnecting: false,
      isConnected: false,
    });
  }

  incrementReconnectAttempt(): void {
    this.updateState({
      reconnectAttempt: this.state.reconnectAttempt + 1,
    });
  }

  updateLastPing(): void {
    this.updateState({
      lastPing: Date.now(),
    });
  }

  // ===== PRIVATE METHODS =====

  private notifyListeners(): void {
    const currentState = this.getState();
    this.stateListeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (error) {
        console.error("Error in socket state listener:", error);
      }
    });
  }

  private hasStateChanged(
    previousState: SocketConnectionState,
    currentState: SocketConnectionState
  ): boolean {
    return (
      previousState.isConnected !== currentState.isConnected ||
      previousState.isConnecting !== currentState.isConnecting ||
      previousState.isReconnecting !== currentState.isReconnecting ||
      previousState.error !== currentState.error ||
      previousState.reconnectAttempt !== currentState.reconnectAttempt ||
      previousState.lastPing !== currentState.lastPing
    );
  }

  // ===== CLEANUP =====

  destroy(): void {
    this.removeAllStateListeners();
    this.resetState();
  }
}
