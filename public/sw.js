// Simple Service Worker for Push Notifications
// This file should be served from the public directory as /sw.js

const CACHE_NAME = 'social-media-mini-v1';
const urlsToCache = [
  '/',
  '/icons/message-icon.png',
  '/icons/badge-icon.png',
  '/icons/reply-icon.png',
  '/icons/check-icon.png',
  '/icons/typing-icon.png',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()), // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.data);

  event.notification.close();

  const data = event.notification.data || {};
  const { type, conversationId, messageId } = data;

  // Handle notification action
  if (event.action) {
    handleNotificationAction(event.action, data);
    return;
  }

  // Default click behavior - open the app
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes('/messages') && 'focus' in client) {
            // Focus existing window and navigate to conversation
            client.focus();
            client.postMessage({
              type: 'notification-click',
              data: { conversationId, messageId, type },
            });
            return;
          }
        }

        // Open new window if app is not open
        if (clients.openWindow) {
          const url = conversationId
            ? `/messages?conversation=${conversationId}`
            : '/messages';
          return clients.openWindow(url);
        }
      }),
  );
});

// Handle notification actions
function handleNotificationAction(action, data) {
  const { conversationId, messageId } = data;

  switch (action) {
    case 'reply':
      // Open app with quick reply
      clients.openWindow(`/messages?conversation=${conversationId}&reply=true`);
      break;

    case 'mark-read':
      // Send message to client to mark as read
      clients.matchAll({ type: 'window' }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'notification-action',
            data: { action: 'mark-read', conversationId, messageId },
          });
        });
      });
      break;

    default:
      console.log('Unknown notification action:', action);
  }
}

// Background sync for offline message sending (if needed in future)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-message-sync') {
    event.waitUntil(
      // Handle background message synchronization
      console.log('Background sync triggered for messages'),
    );
  }
});

// Push event (for future server-side push notifications)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const { title, body, icon, badge, tag, data: notificationData } = data;

    const options = {
      body,
      icon: icon || '/icons/message-icon.png',
      badge: badge || '/icons/badge-icon.png',
      tag,
      data: notificationData,
      actions: [
        {
          action: 'reply',
          title: 'Reply',
          icon: '/icons/reply-icon.png',
        },
        {
          action: 'mark-read',
          title: 'Mark as Read',
          icon: '/icons/check-icon.png',
        },
      ],
      requireInteraction: true,
      silent: false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Message from client
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'skip-waiting':
      self.skipWaiting();
      break;

    case 'get-version':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;

    default:
      console.log('Unknown message from client:', event.data);
  }
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for static assets
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    }),
  );
});
