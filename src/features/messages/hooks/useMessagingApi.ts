import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { messagingApi } from '../services/api.service';
import {
  CreatePrivateConversationRequest,
  CreateGroupConversationRequest,
  SendMessageRequest,
  UpdateMessageRequest,
  AddReactionRequest,
  GetConversationsQuery,
  GetMessagesQuery,
  ApiConversation,
  ApiMessage,
} from '../types/api.types';

// Query Keys
export const messagingKeys = {
  all: ['messaging'] as const,
  conversations: () => [...messagingKeys.all, 'conversations'] as const,
  conversationsList: (query?: GetConversationsQuery) =>
    [...messagingKeys.conversations(), 'list', query] as const,
  conversation: (id: string) =>
    [...messagingKeys.conversations(), 'detail', id] as const,
  messages: (conversationId: string) =>
    [...messagingKeys.all, 'messages', conversationId] as const,
  messagesList: (conversationId: string, query?: GetMessagesQuery) =>
    [...messagingKeys.messages(conversationId), 'list', query] as const,
};

// Conversation Hooks
export function useConversations(query?: GetConversationsQuery) {
  return useInfiniteQuery({
    queryKey: messagingKeys.conversationsList(query),
    queryFn: ({ pageParam }) =>
      messagingApi.getConversations({
        ...query,
        cursor: pageParam as string,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: messagingKeys.conversation(id),
    queryFn: () => messagingApi.getConversationById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreatePrivateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePrivateConversationRequest) =>
      messagingApi.createPrivateConversation(data),
    onSuccess: (conversation) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: messagingKeys.conversations(),
      });
      toast.success('Conversation created successfully');
      return conversation;
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create conversation',
      );
    },
  });
}

export function useCreateGroupConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupConversationRequest) =>
      messagingApi.createGroupConversation(data),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.conversations(),
      });
      toast.success('Group conversation created successfully');
      return conversation;
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create group conversation',
      );
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messagingApi.deleteConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.conversations(),
      });
      queryClient.removeQueries({ queryKey: messagingKeys.conversation(id) });
      queryClient.removeQueries({ queryKey: messagingKeys.messages(id) });
      toast.success('Conversation deleted successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to delete conversation',
      );
    },
  });
}

export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messagingApi.archiveConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.conversations(),
      });
      toast.success('Conversation archived');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to archive conversation',
      );
    },
  });
}

// Message Hooks
export function useMessages(conversationId: string, query?: GetMessagesQuery) {
  return useInfiniteQuery({
    queryKey: messagingKeys.messagesList(conversationId, query),
    queryFn: ({ pageParam }) =>
      messagingApi.getMessages(conversationId, {
        ...query,
        cursor: pageParam as string,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds for messages
    refetchOnWindowFocus: false,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => messagingApi.sendMessage(data),
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: messagingKeys.messages(newMessage.conversationId),
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(
        messagingKeys.messagesList(newMessage.conversationId),
      );

      // Optimistically update to the new value
      const tempMessage: ApiMessage = {
        id: `temp-${Date.now()}`,
        conversationId: newMessage.conversationId,
        senderId: 'current-user', // Will be replaced by actual user ID
        content: newMessage.content,
        type: newMessage.type || 'text',
        status: 'sent',
        sentAt: new Date().toISOString(),
        attachmentUrl: newMessage.attachmentUrl,
        replyToMessageId: newMessage.replyToMessageId,
        reactions: [],
      };

      queryClient.setQueryData(
        messagingKeys.messagesList(newMessage.conversationId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) =>
              index === 0
                ? { ...page, messages: [tempMessage, ...page.messages] }
                : page,
            ),
          };
        },
      );

      return { previousMessages };
    },
    onError: (error, newMessage, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          messagingKeys.messagesList(newMessage.conversationId),
          context.previousMessages,
        );
      }
      toast.error('Failed to send message');
    },
    onSuccess: (message) => {
      // Update conversations list to show new last message
      queryClient.invalidateQueries({
        queryKey: messagingKeys.conversations(),
      });
    },
    onSettled: (message, error, variables) => {
      // Always refetch messages to ensure consistency
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(variables.conversationId),
      });
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      data,
    }: {
      conversationId: string;
      messageId: string;
      data: UpdateMessageRequest;
    }) => messagingApi.updateMessage(conversationId, messageId, data),
    onSuccess: (updatedMessage) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(updatedMessage.conversationId),
      });
      toast.success('Message updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update message');
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => messagingApi.deleteMessage(conversationId, messageId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(conversationId),
      });
      toast.success('Message deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => messagingApi.markMessageAsRead(conversationId, messageId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: messagingKeys.conversations(),
      });
    },
  });
}

export function useMarkAllMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      messagingApi.markAllMessagesAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: messagingKeys.conversations(),
      });
    },
  });
}

// Reaction Hooks
export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      emoji,
    }: {
      conversationId: string;
      messageId: string;
      emoji: string;
    }) => messagingApi.addReaction(conversationId, messageId, { emoji }),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(conversationId),
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add reaction');
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      emoji,
    }: {
      conversationId: string;
      messageId: string;
      emoji: string;
    }) => messagingApi.removeReaction(conversationId, messageId, emoji),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(conversationId),
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove reaction');
    },
  });
}

// File Upload Hook
export function useUploadAttachment() {
  return useMutation({
    mutationFn: (file: File) => messagingApi.uploadAttachment(file),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    },
  });
}
