// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_API_URL) {
    console.log('Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // Check if running locally (localhost) or deployed
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname);

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const url = 'http://localhost:5000/api';
      console.log('Using local API URL:', url);
      return url;
    }
  }

  // For deployed apps, use relative path to same domain
  const url = '/api';
  console.log('Using relative API URL:', url);
  return url;
};

const API_BASE_URL = getApiBaseUrl();
console.log('Final API_BASE_URL:', API_BASE_URL);

// Courses API
export const coursesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (!response.ok) throw new Error('Failed to fetch course');
    return response.json();
  },
  
  create: async (courseData: any) => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) throw new Error('Failed to create course');
    return response.json();
  }
};

// Instructors API
export const instructorsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/instructors`);
    if (!response.ok) throw new Error('Failed to fetch instructors');
    return response.json();
  }
};

// Curriculum API
export const curriculumAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/curriculum`);
    if (!response.ok) throw new Error('Failed to fetch curriculum');
    return response.json();
  },
  
  getByCourseId: async (courseId: string) => {
    const response = await fetch(`${API_BASE_URL}/curriculum/${courseId}`);
    if (!response.ok) throw new Error('Failed to fetch curriculum');
    return response.json();
  }
};

// Users API
export const usersAPI = {
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  create: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  }
};

// Students API
export const studentsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`);
    if (!response.ok) throw new Error('Failed to fetch student');
    return response.json();
  },

  create: async (studentData: any) => {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) throw new Error('Failed to create student');
    return response.json();
  },

  update: async (id: string, studentData: any) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) throw new Error('Failed to update student');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete student');
    return response.json();
  }
};

// Buyers API
export const buyersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/buyers`);
    if (!response.ok) throw new Error('Failed to fetch buyers');
    return response.json();
  },

  create: async (buyerData: any) => {
    const response = await fetch(`${API_BASE_URL}/buyers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buyerData),
    });
    if (!response.ok) throw new Error('Failed to create buyer');
    return response.json();
  },

  update: async (id: string, buyerData: any) => {
    const response = await fetch(`${API_BASE_URL}/buyers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buyerData),
    });
    if (!response.ok) throw new Error('Failed to update buyer');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/buyers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete buyer');
    return response.json();
  }
};

// Tokens API
export const tokensAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/tokens`);
    if (!response.ok) throw new Error('Failed to fetch tokens');
    return response.json();
  },

  create: async (tokenData: any) => {
    const response = await fetch(`${API_BASE_URL}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenData),
    });
    if (!response.ok) throw new Error('Failed to create token');
    return response.json();
  },

  update: async (id: string, tokenData: any) => {
    const response = await fetch(`${API_BASE_URL}/tokens/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenData),
    });
    if (!response.ok) throw new Error('Failed to update token');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/tokens/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete token');
    return response.json();
  }
};

// Coupons API
export const couponsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/coupons`);
    if (!response.ok) throw new Error('Failed to fetch coupons');
    return response.json();
  },

  create: async (couponData: any) => {
    const response = await fetch(`${API_BASE_URL}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData),
    });
    if (!response.ok) throw new Error('Failed to create coupon');
    return response.json();
  },

  update: async (id: string, couponData: any) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData),
    });
    if (!response.ok) throw new Error('Failed to update coupon');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete coupon');
    return response.json();
  }
};

// Orders API
export const ordersAPI = {
  create: async (orderData: any) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  getByUserId: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  }
};

// Admin Authentication API
export const adminAPI = {
  login: async (adminId: string, password: string) => {
    try {
      const url = `${API_BASE_URL}/admin/login`;
      console.log('API URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check content-type before parsing JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        // Response is not JSON, likely an error from server/proxy
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Backend API not available. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  },

  verify: async (adminId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify`, {
        headers: { 'x-admin-id': adminId },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Verification failed');
    }
  }
};
