import axios from '@/lib/axios';
import {
  ApiConversation,
  ApiConversationWithLastMessage,
  ApiMessage,
  CreatePrivateConversationRequest,
  CreateGroupConversationRequest,
  SendMessageRequest,
  UpdateMessageRequest,
  AddReactionRequest,
  GetConversationsQuery,
  GetMessagesQuery,
  PaginatedConversationsResponse,
  PaginatedMessagesResponse,
  ApiResponse,
} from '../types/api.types';

export class MessagingApiService {
  private readonly baseUrl = '/api/conversations';

  // Conversation endpoints
  async getConversations(
    query?: GetConversationsQuery,
  ): Promise<PaginatedConversationsResponse> {
    const params = new URLSearchParams();
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.cursor) params.append('cursor', query.cursor);

    const response = await axios.get<
      ApiResponse<PaginatedConversationsResponse>
    >(`${this.baseUrl}?${params.toString()}`);
    return response.data.data;
  }

  async getConversationById(id: string): Promise<ApiConversation> {
    const response = await axios.get<ApiResponse<ApiConversation>>(
      `${this.baseUrl}/${id}`,
    );
    return response.data.data;
  }

  async createPrivateConversation(
    data: CreatePrivateConversationRequest,
  ): Promise<ApiConversation> {
    const response = await axios.post<ApiResponse<ApiConversation>>(
      `${this.baseUrl}/private`,
      data,
    );
    return response.data.data;
  }

  async createGroupConversation(
    data: CreateGroupConversationRequest,
  ): Promise<ApiConversation> {
    const response = await axios.post<ApiResponse<ApiConversation>>(
      `${this.baseUrl}/group`,
      data,
    );
    return response.data.data;
  }

  async deleteConversation(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  async archiveConversation(id: string): Promise<void> {
    await axios.patch(`${this.baseUrl}/${id}/archive`);
  }

  async unarchiveConversation(id: string): Promise<void> {
    await axios.patch(`${this.baseUrl}/${id}/unarchive`);
  }

  async addParticipant(conversationId: string, userId: string): Promise<void> {
    await axios.post(`${this.baseUrl}/${conversationId}/participants`, {
      userId,
    });
  }

  async removeParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await axios.delete(
      `${this.baseUrl}/${conversationId}/participants/${userId}`,
    );
  }

  async leaveConversation(conversationId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${conversationId}/leave`);
  }

  // Message endpoints
  async getMessages(
    conversationId: string,
    query?: GetMessagesQuery,
  ): Promise<PaginatedMessagesResponse> {
    const params = new URLSearchParams();
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.cursor) params.append('cursor', query.cursor);
    if (query?.before) params.append('before', query.before);

    const response = await axios.get<ApiResponse<PaginatedMessagesResponse>>(
      `${this.baseUrl}/${conversationId}/messages?${params.toString()}`,
    );
    return response.data.data;
  }

  async sendMessage(data: SendMessageRequest): Promise<ApiMessage> {
    const response = await axios.post<ApiResponse<ApiMessage>>(
      `${this.baseUrl}/${data.conversationId}/messages`,
      data,
    );
    return response.data.data;
  }

  async updateMessage(
    conversationId: string,
    messageId: string,
    data: UpdateMessageRequest,
  ): Promise<ApiMessage> {
    const response = await axios.patch<ApiResponse<ApiMessage>>(
      `${this.baseUrl}/${conversationId}/messages/${messageId}`,
      data,
    );
    return response.data.data;
  }

  async deleteMessage(
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    await axios.delete(
      `${this.baseUrl}/${conversationId}/messages/${messageId}`,
    );
  }

  async markMessageAsRead(
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    await axios.patch(
      `${this.baseUrl}/${conversationId}/messages/${messageId}/read`,
    );
  }

  async markAllMessagesAsRead(conversationId: string): Promise<void> {
    await axios.patch(`${this.baseUrl}/${conversationId}/messages/read-all`);
  }

  // Reaction endpoints
  async addReaction(
    conversationId: string,
    messageId: string,
    data: AddReactionRequest,
  ): Promise<void> {
    await axios.post(
      `${this.baseUrl}/${conversationId}/messages/${messageId}/reactions`,
      data,
    );
  }

  async removeReaction(
    conversationId: string,
    messageId: string,
    emoji: string,
  ): Promise<void> {
    await axios.delete(
      `${this.baseUrl}/${conversationId}/messages/${messageId}/reactions/${emoji}`,
    );
  }

  // Typing indicators (WebSocket events, but we can have HTTP fallback)
  async sendTypingIndicator(
    conversationId: string,
    isTyping: boolean,
  ): Promise<void> {
    await axios.post(`${this.baseUrl}/${conversationId}/typing`, { isTyping });
  }

  // File upload for attachments
  async uploadAttachment(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<ApiResponse<{ url: string }>>(
      '/api/upload/message-attachment',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data.data;
  }

  // Search messages (if implemented)
  async searchMessages(
    query: string,
    conversationId?: string,
  ): Promise<ApiMessage[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (conversationId) params.append('conversationId', conversationId);

    const response = await axios.get<ApiResponse<ApiMessage[]>>(
      `/api/messages/search?${params.toString()}`,
    );
    return response.data.data;
  }
}

// Export singleton instance
export const messagingApi = new MessagingApiService();
