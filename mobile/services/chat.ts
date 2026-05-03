import { api } from './api';

export interface Message {
  id: number;
  room: number;
  sender: number;
  text: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  client: number;
  provider: number;
  last_message: Message | null;
  unread_count: number;
  other_user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export const chatService = {
  getRooms: async (): Promise<ChatRoom[]> => {
    try {
      const data = await api<any>('/chat/rooms/', { authenticated: true });
      if (data && data.results && Array.isArray(data.results)) return data.results;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  getOrCreateRoom: async (providerId: number): Promise<ChatRoom> => {
    return await api<ChatRoom>('/chat/rooms/get_or_create/', { 
      method: 'POST',
      body: { provider_id: providerId }, 
      authenticated: true 
    });
  },

  getMessages: async (roomId: number): Promise<Message[]> => {
    try {
      const data = await api<any>(`/chat/rooms/${roomId}/messages/`, { authenticated: true });
      if (data && data.results && Array.isArray(data.results)) return data.results;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }
};
