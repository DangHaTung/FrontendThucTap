import { useState } from 'react';
import api from '../api/index';

export default function APITest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await api.post('/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: '123456'
      });
      setResult({ type: 'register', data: response.data });
    } catch (error: any) {
      setResult({ type: 'register', error: error.response?.data || error.message });
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/login', {
        email: 'test@example.com',
        password: '123456'
      });
      setResult({ type: 'login', data: response.data });
      
      // Save token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.data.username);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
    } catch (error: any) {
      setResult({ type: 'login', error: error.response?.data || error.message });
    }
    setLoading(false);
  };

  const testBoards = async () => {
    setLoading(true);
    try {
      const response = await api.get('http://localhost:3000/api/boards');
      setResult({ type: 'boards', data: response.data });
    } catch (error: any) {
      setResult({ type: 'boards', error: error.response?.data || error.message });
    }
    setLoading(false);
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user');
    setResult(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Component</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testRegister}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Register
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Login
          </button>
          
          <button
            onClick={testBoards}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Test Boards API
          </button>
          
          <button
            onClick={clearToken}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Token
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Current Token:</h3>
          <p className="text-sm bg-gray-100 p-2 rounded break-all">
            {localStorage.getItem('token') || 'No token'}
          </p>
        </div>

        {loading && (
          <div className="text-blue-600">Loading...</div>
        )}

        {result && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Result ({result.type}):</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

