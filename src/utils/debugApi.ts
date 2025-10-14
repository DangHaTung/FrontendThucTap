import api from '../api/authApi';

export const debugApi = {
  // Test authentication
  testAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Current token:', token);
      
      if (!token) {
        console.error('No token found in localStorage');
        return false;
      }

      // Test boards endpoint
      const response = await api.get('boards');
      console.log('Boards API response:', response.data);
      return true;
    } catch (error) {
      console.error('Auth test failed:', error);

      return false;
    }
  },

  // Test all endpoints
  testAllEndpoints: async () => {
    const results = {
      boards: false,
      lists: false,
      cards: false,
      labels: false,
      comments: false,
      search: false
    };

    try {
      // Test boards
      try {
        await api.get('/api/boards');
        results.boards = true;
        console.log('✅ Boards API working');
      } catch (error) {
        console.error('❌ Boards API failed:', error.response?.data || error.message);
      }

      // Test search
      try {
        await api.get('/api/search/boards', { params: { query: 'test' } });
        results.search = true;
        console.log('✅ Search API working');
      } catch (error) {
        console.error('❌ Search API failed:', error.response?.data || error.message);
      }

      return results;
    } catch (error) {
      console.error('API test failed:', error);
      return results;
    }
  }
};

