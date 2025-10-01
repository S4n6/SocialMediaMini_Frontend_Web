import React from "react";

/**
 * Event Bus for managing complex socket events and cross-component communication
 */

type EventCallback<T = any> = (data: T) => void;
type EventUnsubscribe = () => void;

interface EventMap {
  // Profile events
  "profile:viewed": { profileId: string; viewerId?: string };
  "profile:followed": { userId: string; followerId: string };
  "profile:unfollowed": { userId: string; followerId: string };
  "profile:updated": { userId: string; updates: any };

  // Post events
  "post:liked": { postId: string; userId: string; likeCount: number };
  "post:unliked": { postId: string; userId: string; likeCount: number };
  "post:commented": { postId: string; userId: string; comment: any };
  "post:deleted": { postId: string; userId: string };

  // Message events
  "message:sent": { messageId: string; senderId: string; receiverId: string };
  "message:received": {
    messageId: string;
    senderId: string;
    receiverId: string;
  };
  "message:typing": { senderId: string; receiverId: string; isTyping: boolean };

  // Notification events
  "notification:new": { notification: any; userId: string };
  "notification:read": { notificationId: string; userId: string };

  // Connection events
  "connection:established": { userId: string; socketId: string };
  "connection:lost": { userId: string; reason: string };
  "connection:reconnected": { userId: string; attempt: number };

  // UI events
  "ui:toast": { type: "success" | "error" | "info"; message: string };
  "ui:modal": { type: string; props: any };
  "ui:loading": { key: string; isLoading: boolean };
}

class EventBus {
  private events: Map<keyof EventMap, Set<EventCallback>> = new Map();
  private onceEvents: Map<keyof EventMap, Set<EventCallback>> = new Map();
  private maxListeners = 50;

  /**
   * Subscribe to an event
   */
  on<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>
  ): EventUnsubscribe {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const eventSet = this.events.get(event)!;

    if (eventSet.size >= this.maxListeners) {
      console.warn(
        `Too many listeners for event ${event}. Consider using once() or removing unused listeners.`
      );
    }

    eventSet.add(callback);

    // Return unsubscribe function
    return () => {
      eventSet.delete(callback);
      if (eventSet.size === 0) {
        this.events.delete(event);
      }
    };
  }

  /**
   * Subscribe to an event that fires only once
   */
  once<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>
  ): EventUnsubscribe {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set());
    }

    this.onceEvents.get(event)!.add(callback);

    return () => {
      this.onceEvents.get(event)?.delete(callback);
    };
  }

  /**
   * Emit an event to all subscribers
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    // Emit to regular subscribers
    const eventSet = this.events.get(event);
    if (eventSet) {
      eventSet.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }

    // Emit to once subscribers and remove them
    const onceEventSet = this.onceEvents.get(event);
    if (onceEventSet) {
      onceEventSet.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in once event handler for ${event}:`, error);
        }
      });
      this.onceEvents.delete(event);
    }
  }

  /**
   * Remove all listeners for an event
   */
  off<K extends keyof EventMap>(event: K): void {
    this.events.delete(event);
    this.onceEvents.delete(event);
  }

  /**
   * Remove specific callback for an event
   */
  removeListener<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>
  ): void {
    this.events.get(event)?.delete(callback);
    this.onceEvents.get(event)?.delete(callback);
  }

  /**
   * Get listener count for an event
   */
  listenerCount<K extends keyof EventMap>(event: K): number {
    const regular = this.events.get(event)?.size || 0;
    const once = this.onceEvents.get(event)?.size || 0;
    return regular + once;
  }

  /**
   * Get all active events
   */
  getActiveEvents(): string[] {
    const regularEvents = Array.from(this.events.keys());
    const onceEvents = Array.from(this.onceEvents.keys());
    return [...new Set([...regularEvents, ...onceEvents])];
  }

  /**
   * Clear all listeners
   */
  removeAllListeners(): void {
    this.events.clear();
    this.onceEvents.clear();
  }

  /**
   * Set maximum listeners per event
   */
  setMaxListeners(max: number): void {
    this.maxListeners = max;
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    const events: Record<string, number> = {};

    for (const [event, listeners] of this.events.entries()) {
      events[event] = listeners.size;
    }

    for (const [event, listeners] of this.onceEvents.entries()) {
      const key = `${event} (once)`;
      events[key] = listeners.size;
    }

    return {
      totalEvents: this.getActiveEvents().length,
      totalListeners: Object.values(events).reduce(
        (sum, count) => sum + count,
        0
      ),
      events,
    };
  }
}

// Singleton instance
export const eventBus = new EventBus();

// React hook for using event bus
export const useEventBus = <K extends keyof EventMap>(
  event: K,
  callback: EventCallback<EventMap[K]>,
  deps: React.DependencyList = []
): EventUnsubscribe => {
  const callbackRef = React.useRef(callback);
  const unsubscribeRef = React.useRef<EventUnsubscribe | null>(null);

  // Update callback ref when dependencies change
  React.useEffect(() => {
    callbackRef.current = callback;
  }, deps);

  // Subscribe/unsubscribe effect
  React.useEffect(() => {
    const wrappedCallback = (data: EventMap[K]) => {
      callbackRef.current(data);
    };

    unsubscribeRef.current = eventBus.on(event, wrappedCallback);

    return () => {
      unsubscribeRef.current?.();
    };
  }, [event]);

  return () => {
    unsubscribeRef.current?.();
  };
};

// Hook for emitting events
export const useEventEmitter = () => {
  return {
    emit: eventBus.emit.bind(eventBus),
    emitToast: (type: "success" | "error" | "info", message: string) => {
      eventBus.emit("ui:toast", { type, message });
    },
    emitLoading: (key: string, isLoading: boolean) => {
      eventBus.emit("ui:loading", { key, isLoading });
    },
  };
};

// Hook for once events
export const useEventOnce = <K extends keyof EventMap>(
  event: K,
  callback: EventCallback<EventMap[K]>,
  deps: React.DependencyList = []
): void => {
  React.useEffect(() => {
    const unsubscribe = eventBus.once(event, callback);
    return unsubscribe;
  }, [event, ...deps]);
};

// Utility functions for common event patterns
export const createEventLogger = (prefix: string = "EventBus") => {
  return <K extends keyof EventMap>(event: K, data: EventMap[K]) => {
    console.log(`[${prefix}] ${event}:`, data);
  };
};

export const createEventCounter = () => {
  const counts: Record<string, number> = {};

  return {
    count: <K extends keyof EventMap>(event: K) => {
      counts[event] = (counts[event] || 0) + 1;
    },
    getCounts: () => ({ ...counts }),
    reset: () => {
      Object.keys(counts).forEach((key) => delete counts[key]);
    },
  };
};

export default eventBus;
