# WebSocket / Real-Time Best Practices

> Tailored for **SocialMediaMini** – Next.js 15 + Socket.IO Client (`socket.io-client ^4.8`)

---

## 1. Architecture Overview

```
src/
├── lib/socket/
│   ├── config.ts                 # Env-based URL, reconnect policy, rate limits
│   ├── SocketManager.ts          # Singleton facade – owns connection + services
│   ├── core/
│   │   ├── SocketConnection.ts   # Low-level connect / disconnect / reconnect
│   │   ├── SocketEventManager.ts # Typed publish / subscribe bus
│   │   └── SocketStateManager.ts # Connection-state machine (connected/reconnecting/…)
│   └── services/                 # Feature-specific services
│       ├── MessageSocketService.ts
│       ├── NotificationSocketService.ts
│       ├── PostSocketService.ts
│       └── ProfileSocketService.ts
├── providers/
│   └── BasicSocketProvider.tsx   # React context that exposes the SocketManager
├── hooks/
│   └── useSimpleRealtimeFeatures.ts  # Domain hooks (presence, typing, etc.)
└── types/
    └── socket.ts                 # Shared event maps: ClientToServerEvents, ServerToClientEvents
```

### Why this layout?

| Layer                | Responsibility                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **types/socket.ts**  | Single source of truth for every event name + payload. Both client and server can share this file (via a shared package).             |
| **SocketManager**    | Singleton. All code accesses the socket through it—never `import { io }` directly.                                                    |
| **Feature services** | Encapsulate domain logic (e.g. `messages.sendMessage()`). They subscribe to the `SocketEventManager` bus, **not** to raw `socket.on`. |
| **Provider + hooks** | React layer. Provider instantiates the manager; hooks consume it. Components never touch the manager directly.                        |

---

## 2. Connection Lifecycle

```ts
// lib/socket/config.ts  (already in your codebase)
export const getSocketConfig = (): SocketConfig => ({
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001',
  options: {
    autoConnect: false, // connect AFTER auth is confirmed
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000, // 1 s initial back-off
    timeout: 20000,
    transports: ['websocket', 'polling'], // WS first, HTTP-long-poll fallback
  },
});
```

### Key rules

1. **Never auto-connect.** Call `socketManager.connect(userId)` only after the JWT is available (e.g. in `AuthProvider` after login succeeds).
2. **Disconnect on logout.** `socketManager.disconnect()` in the logout flow.
3. **Attach the JWT** via `auth` option or an `extraHeaders`:

```ts
const socket = io(url, {
  ...options,
  auth: { token: accessToken }, // Socket.IO sends this on every connection handshake
});
```

4. **Handle token refresh.** If the server emits an `auth_error`, refresh the token and reconnect:

```ts
socket.on('connect_error', async (err) => {
  if (err.message === 'TOKEN_EXPIRED') {
    const newToken = await refreshToken();
    socket.auth = { token: newToken };
    socket.connect();
  }
});
```

---

## 3. Typed Events

Your `types/socket.ts` should export two maps, one per direction:

```ts
// types/socket.ts
export interface ServerToClientEvents {
  'message:received': (msg: Message) => void;
  'message:typing': (data: { userId: string; conversationId: string }) => void;
  'notification:new': (notification: Notification) => void;
  'post:liked': (data: {
    postId: string;
    userId: string;
    likesCount: number;
  }) => void;
  'presence:update': (data: {
    userId: string;
    status: 'online' | 'offline';
  }) => void;
}

export interface ClientToServerEvents {
  'message:send': (data: {
    conversationId: string;
    content: string;
    type: string;
  }) => void;
  'message:typing': (data: {
    conversationId: string;
    isTyping: boolean;
  }) => void;
  'room:join': (room: string) => void;
  'room:leave': (room: string) => void;
}
```

Then pass them to `io()`:

```ts
import { io, Socket } from 'socket.io-client';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  url,
  opts,
);
// socket.emit('message:send', { ... })  ← TypeScript auto-completes
```

---

## 4. Room Strategy

Rooms avoid broadcasting everything to everyone.

| Room pattern             | When to join            | When to leave                     |
| ------------------------ | ----------------------- | --------------------------------- |
| `notifications:{userId}` | On connect              | On disconnect                     |
| `chat:{conversationId}`  | User opens chat         | User closes chat / navigates away |
| `post:{postId}`          | Post detail page mounts | Unmount                           |
| `profile:{profileId}`    | Profile page mounts     | Unmount                           |

Rooms are managed in hooks:

```tsx
function useChatRoom(conversationId: string) {
  const { emit } = useSocket();

  useEffect(() => {
    emit('room:join', `chat:${conversationId}`);
    return () => {
      emit('room:leave', `chat:${conversationId}`);
    };
  }, [conversationId, emit]);
}
```

---

## 5. Reconnection & Resilience

Socket.IO handles reconnection automatically, but you need to **re-join rooms** and **re-sync state** on reconnect:

```ts
socket.on('connect', () => {
  // Re-join rooms
  activeRooms.forEach((room) => socket.emit('room:join', room));

  // Re-sync missed data (ask server for events since lastEventId)
  socket.emit('sync:request', { since: lastEventTimestamp });
});
```

### Offline queue

Buffer outgoing events while disconnected:

```ts
class OfflineQueue {
  private queue: Array<{ event: string; data: any }> = [];

  enqueue(event: string, data: any) {
    this.queue.push({ event, data });
  }

  flush(socket: Socket) {
    while (this.queue.length) {
      const { event, data } = this.queue.shift()!;
      socket.emit(event as any, data);
    }
  }
}
```

---

## 6. Performance Guidelines

### 6.1 Throttle / debounce high-frequency events

Typing indicators are a classic example — emit at most once every 2 s:

```ts
const emitTyping = throttle((conversationId: string) => {
  socket.emit('message:typing', { conversationId, isTyping: true });
}, 2000);
```

### 6.2 Batched updates

For feeds with rapid likes/comments, batch server-side and emit a single `post:stats_batch` event every N seconds instead of per-action.

### 6.3 Rate limiting (client-side)

Already configured in your `config.ts`:

```ts
export const RATE_LIMITS = {
  MESSAGE_SEND: { limit: 10, window: 60000 }, // 10 msgs / min
};
```

Apply it before emitting:

```ts
if (!rateLimiter.allow('MESSAGE_SEND')) {
  toast.error('You are sending messages too quickly');
  return;
}
socket.emit('message:send', payload);
```

### 6.4 Avoid memory leaks

Always clean up listeners in `useEffect` return. Use the feature-service pattern (your `PostSocketService`, etc.) to centralize subscribe/unsubscribe logic.

---

## 7. Integrating with React Query

Keep your REST queries as the source of truth and use WebSocket events as **cache invalidations**:

```ts
// In a feature service or hook
socket.on('post:liked', ({ postId }) => {
  queryClient.invalidateQueries({ queryKey: ['post', postId] });
});

socket.on('message:received', (message) => {
  queryClient.setQueryData(
    ['messages', message.conversationId],
    (old: Message[] = []) => [...old, message],
  );
});
```

This keeps the Query cache fresh without duplicating state management.

---

## 8. Migrating `BasicSocketProvider` to Real Sockets

Your current `BasicSocketProvider` is a stub. Here is the migration path:

```tsx
// providers/SocketProvider.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@/types/socket';
import { getSocketConfig } from '@/lib/socket/config';
import { useAuth } from '@/hooks/redux'; // wherever your auth state lives

interface SocketContextValue {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const { url, options } = getSocketConfig();
    const s = io(url, { ...options, auth: { token } });

    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));

    socketRef.current = s;

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
```

---

## 9. Testing WebSocket Code

Use **vitest** (already configured in your project) with a mock socket:

```ts
import { vi } from 'vitest';

function createMockSocket() {
  const handlers = new Map<string, Function[]>();
  return {
    on: vi.fn((event, handler) => {
      handlers.set(event, [...(handlers.get(event) ?? []), handler]);
    }),
    emit: vi.fn(),
    off: vi.fn(),
    // simulate a server event in tests
    __trigger: (event: string, ...args: any[]) => {
      handlers.get(event)?.forEach((fn) => fn(...args));
    },
  };
}
```

---

## 10. Security Checklist

- [ ] Authenticate on the `connection` event server-side (`socket.handshake.auth.token`)
- [ ] Validate room joins — users should only join rooms they are allowed in
- [ ] Sanitize all payloads before broadcasting
- [ ] Use `wss://` in production
- [ ] Implement server-side rate limiting in addition to client-side

---

## Quick Reference: Event Naming Convention

Use **`domain:action`** format:

```
message:send       message:received      message:typing
post:create        post:liked            post:commented
notification:new   notification:read
presence:update    presence:ping
room:join          room:leave
```

Prefix server → client events differently if needed (e.g. `s2c:` prefix), but the `ServerToClientEvents` / `ClientToServerEvents` types already disambiguate direction in code.
