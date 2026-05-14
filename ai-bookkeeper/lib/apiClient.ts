const BASE_URL = 'https://kudi-v2.onrender.com/api';

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function apiClient(endpoint: string, options: RequestOptions = {}) {
  const { data, headers: customHeaders, ...customConfig } = options;

  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('ai-bk-token');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customHeaders,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        // Handle unauthorized (token expired or invalid)
        localStorage.removeItem('ai-bk-token');
        localStorage.removeItem('ai-bk-user');
        localStorage.removeItem('ai-bk-is-logged');
        window.location.href = '/login';
      }
      let errorMessage = result.error || result.message || 'An error occurred during the request.';
      if (typeof errorMessage === 'object') {
        errorMessage = JSON.stringify(errorMessage);
      }
      throw new Error(errorMessage);
    }
    
    return result;
  } catch (error) {
    console.error('API Client Error:', error);
    throw error;
  }
}
