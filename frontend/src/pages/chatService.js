import axios from 'axios';

// Base URL for API calls - change this to match your Django backend URL
const API_BASE_URL = 'http://localhost:8000/api';

// Simple axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat service functions
const chatService = {
  // Send message to chatbot and get response
  sendMessage: async (message) => {
    try {
      const response = await api.post('/chat/', { message });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

export default chatService;