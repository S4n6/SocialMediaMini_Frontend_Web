export interface NetworkStatus {
  isOnline: boolean;
  connectionType?: string;
  effectiveConnectionType?: string;
  downlink?: number;
  rtt?: number;
}

export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private currentStatus: NetworkStatus = { isOnline: navigator.onLine };

  private constructor() {
    this.initializeNetworkMonitoring();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private initializeNetworkMonitoring(): void {
    // Basic online/offline detection
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Advanced connection monitoring (if supported)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener(
          'change',
          this.handleConnectionChange.bind(this),
        );
        this.updateAdvancedStatus(connection);
      }
    }

    // Initial status
    this.updateStatus();
  }

  private handleOnline(): void {
    this.currentStatus.isOnline = true;
    this.updateStatus();
  }

  private handleOffline(): void {
    this.currentStatus.isOnline = false;
    this.updateStatus();
  }

  private handleConnectionChange(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.updateAdvancedStatus(connection);
    }
    this.updateStatus();
  }

  private updateAdvancedStatus(connection: any): void {
    this.currentStatus = {
      ...this.currentStatus,
      connectionType: connection.type || 'unknown',
      effectiveConnectionType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
    };
  }

  private updateStatus(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentStatus);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  // Public API
  getCurrentStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  isOnline(): boolean {
    return this.currentStatus.isOnline;
  }

  isSlowConnection(): boolean {
    const { effectiveConnectionType, downlink } = this.currentStatus;

    // Check for slow connection types
    if (
      effectiveConnectionType === 'slow-2g' ||
      effectiveConnectionType === '2g'
    ) {
      return true;
    }

    // Check for low bandwidth (less than 1 Mbps)
    if (downlink && downlink < 1) {
      return true;
    }

    return false;
  }

  addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  removeListener(listener: (status: NetworkStatus) => void): void {
    this.listeners.delete(listener);
  }

  // Test connectivity by pinging a reliable endpoint
  async testConnectivity(url: string = '/api/health'): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Connectivity test failed:', error);
      return false;
    }
  }

  // Get connection quality assessment
  getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
    if (!this.currentStatus.isOnline) {
      return 'offline';
    }

    const { effectiveConnectionType, downlink, rtt } = this.currentStatus;

    // Excellent: 4G with good metrics
    if (
      effectiveConnectionType === '4g' &&
      downlink &&
      downlink > 5 &&
      rtt &&
      rtt < 100
    ) {
      return 'excellent';
    }

    // Good: 3G or decent 4G
    if (effectiveConnectionType === '3g' || effectiveConnectionType === '4g') {
      return 'good';
    }

    // Poor: 2G or slow connections
    if (
      effectiveConnectionType === '2g' ||
      effectiveConnectionType === 'slow-2g'
    ) {
      return 'poor';
    }

    // Default to good if we can't determine
    return 'good';
  }
}

// Export singleton instance
export const networkMonitor = NetworkMonitor.getInstance();

// React hook for network status
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(
    networkMonitor.getCurrentStatus(),
  );

  useEffect(() => {
    const unsubscribe = networkMonitor.addListener(setStatus);
    return unsubscribe;
  }, []);

  return {
    ...status,
    isSlowConnection: networkMonitor.isSlowConnection(),
    connectionQuality: networkMonitor.getConnectionQuality(),
    testConnectivity: networkMonitor.testConnectivity.bind(networkMonitor),
  };
}

// Utility to determine if we should use fallback mode
export function shouldUseFallbackMode(networkStatus: NetworkStatus): boolean {
  // Use fallback if offline
  if (!networkStatus.isOnline) {
    return true;
  }

  // Use fallback for very slow connections
  const quality = networkMonitor.getConnectionQuality();
  if (quality === 'poor' || quality === 'offline') {
    return true;
  }

  return false;
}
