// Use relative path - Vite proxy handles forwarding to backend
const API_BASE_URL = '/api';
if (typeof window !== 'undefined') {
  console.log('Hostname:', window.location.hostname);
  console.log('Port:', window.location.port);
  console.log('API Base URL:', API_BASE_URL);
}

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
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update course');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete course');
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
    const url = `${API_BASE_URL}/students`;
    console.log('Fetching students from:', url);
    try {
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', {
        contentType: response.headers.get('content-type'),
        cors: response.headers.get('access-control-allow-origin')
      });

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from API:', text.substring(0, 200));
        throw new Error(`API returned non-JSON response. Status: ${response.status}`);
      }

      if (!response.ok) throw new Error(`Failed to fetch students (${response.status})`);
      return response.json();
    } catch (error) {
      console.error('Students API error:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    const url = `${API_BASE_URL}/students/${id}`;
    const response = await fetch(url);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned non-JSON response');
    }

    if (!response.ok) throw new Error('Failed to fetch student');
    return response.json();
  },

  create: async (studentData: any) => {
    const url = `${API_BASE_URL}/students`;
    console.log('Creating student at:', url, 'with data:', studentData);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from create:', text.substring(0, 200));
      throw new Error(`API returned non-JSON response. Status: ${response.status}`);
    }

    if (!response.ok) throw new Error(`Failed to create student (${response.status})`);
    return response.json();
  },

  update: async (id: string, studentData: any) => {
    const url = `${API_BASE_URL}/students/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned non-JSON response');
    }

    if (!response.ok) throw new Error(`Failed to update student (${response.status})`);
    return response.json();
  },

  delete: async (id: string) => {
    const url = `${API_BASE_URL}/students/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned non-JSON response');
    }

    if (!response.ok) throw new Error(`Failed to delete student (${response.status})`);
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

// Store API
export const storeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/store`);
    if (!response.ok) throw new Error('Failed to fetch store products');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/store/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/store/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  }
};

// Institute API
export const instituteAPI = {
  get: async () => {
    const response = await fetch(`${API_BASE_URL}/institute`);
    if (!response.ok) throw new Error('Failed to fetch institute settings');
    return response.json();
  },
  update: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/institute`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update institute settings');
    return response.json();
  }
};

// Questions API
export const questionsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/questions`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create question');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update question');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete question');
    return response.json();
  }
};

// Tests API
export const testsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/tests`);
    if (!response.ok) throw new Error('Failed to fetch tests');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create test');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update test');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/tests/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete test');
    return response.json();
  }
};

// Test Series API
export const testSeriesAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-series`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || 'Failed to fetch test series');
      }
      return response.json();
    } catch (error) {
      console.error('Test Series getAll error:', error);
      throw error;
    }
  },
  create: async (data: any) => {
    try {
      console.log('Creating test series with data:', data);
      const response = await fetch(`${API_BASE_URL}/test-series`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('Server error response:', error);
        throw new Error(error.error || error.details || `Failed to create test series (${response.status})`);
      }
      const result = await response.json();
      console.log('Test series created successfully:', result);
      return result;
    } catch (error) {
      console.error('Test Series create error:', error);
      throw error;
    }
  },
  update: async (id: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-series/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || 'Failed to update test series');
      }
      return response.json();
    } catch (error) {
      console.error('Test Series update error:', error);
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-series/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || 'Failed to delete test series');
      }
      return response.json();
    } catch (error) {
      console.error('Test Series delete error:', error);
      throw error;
    }
  }
};

// Subjective Tests API
export const subjectiveTestsAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjective-tests`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || 'Failed to fetch subjective tests');
      }
      return response.json();
    } catch (error) {
      console.error('Subjective Tests getAll error:', error);
      throw error;
    }
  },
  create: async (data: any) => {
    try {
      console.log('Creating subjective test with data:', data);
      const response = await fetch(`${API_BASE_URL}/subjective-tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('Server error response:', error);
        throw new Error(error.error || error.details || `Failed to create subjective test (${response.status})`);
      }
      const result = await response.json();
      console.log('Subjective test created successfully:', result);
      return result;
    } catch (error) {
      console.error('Subjective Test create error:', error);
      throw error;
    }
  },
  update: async (id: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjective-tests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || 'Failed to update subjective test');
      }
      return response.json();
    } catch (error) {
      console.error('Subjective Test update error:', error);
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjective-tests/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || 'Failed to delete subjective test');
      }
      return response.json();
    } catch (error) {
      console.error('Subjective Test delete error:', error);
      throw error;
    }
  }
};

// Videos API
export const videosAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/videos`);
    if (!response.ok) throw new Error('Failed to fetch videos');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create video');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update video');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete video');
    return response.json();
  }
};

// Live Videos API
export const liveVideosAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/live-videos`);
    if (!response.ok) throw new Error('Failed to fetch live videos');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/live-videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create live video');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/live-videos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update live video');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/live-videos/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete live video');
    return response.json();
  }
};

// PDFs API
export const pdfsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/pdfs`);
    if (!response.ok) throw new Error('Failed to fetch PDFs');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/pdfs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create PDF');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/pdfs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update PDF');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/pdfs/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete PDF');
    return response.json();
  }
};

// Packages API
export const packagesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/packages`);
    if (!response.ok) throw new Error('Failed to fetch packages');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create package');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update package');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete package');
    return response.json();
  }
};

// Messages API
export const messagesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create message');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update message');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete message');
    return response.json();
  }
};

// Blog API
export const blogAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/blog`);
    if (!response.ok) throw new Error('Failed to fetch blog posts');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create blog post');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update blog post');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete blog post');
    return response.json();
  }
};

// Settings API
export const settingsAPI = {
  get: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },
  update: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  }
};

// Banners API
export const bannersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/banners`);
    if (!response.ok) throw new Error('Failed to fetch banners');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create banner');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update banner');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete banner');
    return response.json();
  }
};

// Subjects API
export const subjectsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/subjects`);
    if (!response.ok) throw new Error('Failed to fetch subjects');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create subject');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update subject');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete subject');
    return response.json();
  }
};

// Topics API
export const topicsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/topics`);
    if (!response.ok) throw new Error('Failed to fetch topics');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create topic');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/topics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update topic');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/topics/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete topic');
    return response.json();
  }
};

// Subcourses API
export const subcoursesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/subcourses`);
    if (!response.ok) throw new Error('Failed to fetch subcourses');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/subcourses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create subcourse');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/subcourses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update subcourse');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/subcourses/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete subcourse');
    return response.json();
  }
};

// Instructions API
export const instructionsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/instructions`);
    if (!response.ok) throw new Error('Failed to fetch instructions');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/instructions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create instruction');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/instructions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update instruction');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/instructions/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete instruction');
    return response.json();
  }
};

// Exam Documents API
export const examDocumentsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/exam-documents`);
    if (!response.ok) throw new Error('Failed to fetch exam documents');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/exam-documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create exam document');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/exam-documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update exam document');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/exam-documents/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete exam document');
    return response.json();
  }
};

// News API
export const newsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/news`);
    if (!response.ok) throw new Error('Failed to fetch news');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create news');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update news');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete news');
    return response.json();
  }
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create notification');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete notification');
    return response.json();
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.json();
  },
  seed: async () => {
    const response = await fetch(`${API_BASE_URL}/categories/seed`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to seed categories');
    return response.json();
  }
};

// SubCategories API
export const subcategoriesAPI = {
  getAll: async (categoryId?: string) => {
    const url = categoryId ? `${API_BASE_URL}/subcategories?categoryId=${categoryId}` : `${API_BASE_URL}/subcategories`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch subcategories');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create subcategory');
    return response.json();
  },
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update subcategory');
    return response.json();
  },
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/subcategories/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete subcategory');
    return response.json();
  }
};

// Dashboard Stats API
export const dashboardAPI = {
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  }
};
