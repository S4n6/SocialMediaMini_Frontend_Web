import type { SearchResult, SearchHistoryItem } from '../types/search';

/**
 * Mock search results for development/testing.
 * Remove or guard behind `process.env.NODE_ENV === 'development'` before production.
 */
export const mockSearchResults: SearchResult[] = [
  {
    id: 'result1',
    messageId: 'msg1',
    conversationId: 'conv1',
    content: 'Can we discuss the project deadline tomorrow?',
    snippet: 'Can we discuss the <mark>project deadline</mark> tomorrow?',
    messageType: 'text',
    senderId: 'user1',
    senderName: 'John Doe',
    senderAvatar: '',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    matchedText: ['project deadline'],
    contextBefore: 'Hey team, ',
    contextAfter: ' I think we need to review the timeline.',
  },
  {
    id: 'result2',
    messageId: 'msg2',
    conversationId: 'conv2',
    content: 'Here are the project files you requested',
    snippet: 'Here are the <mark>project</mark> files you requested',
    messageType: 'file',
    senderId: 'user2',
    senderName: 'Jane Smith',
    senderAvatar: '',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    matchedText: ['project'],
    attachments: [
      { name: 'project-spec.pdf', type: 'application/pdf', url: '#' },
    ],
  },
];

export const mockSearchHistory: SearchHistoryItem[] = [
  {
    id: '1',
    query: 'project deadline',
    filters: { messageTypes: ['text'] },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resultCount: 12,
  },
  {
    id: '2',
    query: 'meeting notes',
    filters: { conversations: ['conv1'] },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resultCount: 8,
  },
];
