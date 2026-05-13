import axiosInstance from './axiosInstance';

export const getConversations = async () => {
  const response = await axiosInstance.get('/chat/conversations');
  return response.data.conversations;
};

export const startConversation = async (participantId: number) => {
  const response = await axiosInstance.post('/chat/conversations', { participantId });
  return response.data.conversation;
};

export const getMessages = async (conversationId: string, page = 1, limit = 30) => {
  const response = await axiosInstance.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page, limit }
  });
  return response.data;
};

export const sendMessage = async (conversationId: string, encrypted_content: string, iv: string) => {
  const response = await axiosInstance.post(`/chat/conversations/${conversationId}/messages`, {
    encrypted_content,
    iv
  });
  return response.data.message;
};

export const markAsRead = async (messageId: string) => {
  const response = await axiosInstance.patch(`/chat/messages/${messageId}/read`);
  return response.data;
};
