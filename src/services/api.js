export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/api'
    : 'http://localhost:5000/api'
);
export const BACKEND_SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const getBackendFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_SERVER_URL}${cleanPath}`;
};

const getToken = () => {
  return localStorage.getItem('balaji_token') || '';
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API Request failed');
    }
    return data;
  } catch (err) {
    // If backend server is unreachable or offline, rethrow to let caller handle or fallback
    throw err;
  }
};

// Auth API
export const authApi = {
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  checkEmployerStatus: (email) =>
    apiRequest(`/auth/employer-status?email=${encodeURIComponent(email)}`),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (profileData) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
};

// Jobs API
export const jobsApi = {
  getAll: (params = '') => apiRequest(`/jobs${params ? `?${params}` : ''}`),
  getById: (id) => apiRequest(`/jobs/${id}`),
  create: (jobData) =>
    apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    }),
  update: (id, jobData) =>
    apiRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    }),
  delete: (id) =>
    apiRequest(`/jobs/${id}`, {
      method: 'DELETE'
    })
};

// Applications API
export const applicationsApi = {
  apply: (applicationData) =>
    apiRequest('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    }),
  getCandidateApplications: () => apiRequest('/applications/my'),
  getEmployerApplications: () => apiRequest('/applications/employer'),
  updateStatus: (id, statusData) =>
    apiRequest(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    })
};

// Messages API
export const messagesApi = {
  getConversations: () => apiRequest('/messages/conversations'),
  getMessages: (conversationId) => apiRequest(`/messages/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, payload) =>
    apiRequest(`/messages/conversations/${conversationId}/send`, {
      method: 'POST',
      body: JSON.stringify(typeof payload === 'string' ? { text: payload } : payload)
    })
};

// Admin API
export const adminApi = {
  getStats: () => apiRequest('/admin/stats'),
  getUsers: (params = '') => apiRequest(`/admin/users${params ? `?${params}` : ''}`),
  updateUser: (id, data) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteUser: (id) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'DELETE'
    }),
  getEmployers: (params = '') => apiRequest(`/admin/employers${params ? `?${params}` : ''}`),
  approveEmployer: (id) =>
    apiRequest(`/admin/employers/${id}/approve`, {
      method: 'PUT'
    }),
  rejectEmployer: (id, reason = '') =>
    apiRequest(`/admin/employers/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    })
};

// Resume API
export const resumeApi = {
  getResume: () => apiRequest('/resume'),
  saveResume: (resumeData) =>
    apiRequest('/resume', {
      method: 'POST',
      body: JSON.stringify(resumeData)
    }),
  uploadFile: (formData) =>
    apiRequest('/resume/upload-file', {
      method: 'POST',
      body: formData
    }),
  deleteUploadedResume: () =>
    apiRequest('/resume/delete-file', {
      method: 'DELETE'
    })
};
