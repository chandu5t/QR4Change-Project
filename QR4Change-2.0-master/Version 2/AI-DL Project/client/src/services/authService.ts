import api from './api';
import { LoginCredentials, RegisterData, AuthorityRegisterData, ApiResponse, User } from '../types';

export const authService = {
  // User Authentication
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await api.post('/api/user/login', credentials);
      
      if (response.data.status === 'success') {
        // Get user details using the token
        const userResponse = await api.get('/api/user/loggeduser', {
          headers: { Authorization: `Bearer ${response.data.token}` }
        });
        
        return {
          success: true,
          data: {
            user: userResponse.data.user,
            token: response.data.token
          },
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },

  register: async (userData: RegisterData): Promise<ApiResponse> => {
    const response = await api.post('/api/user/register', userData);
    return response.data;
  },

  getLoggedUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/api/user/loggeduser');
      return {
        success: true,
        data: response.data.user,
        message: 'User data retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to get user data'
      };
    }
  },

  // Authority Authentication
  authorityLogin: async (credentials: LoginCredentials): Promise<ApiResponse<{ authority: User; token: string }>> => {
    try {
      const response = await api.post('/api/authority/login', credentials);
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            authority: response.data.authority,
            token: response.data.token
          },
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Authority login failed'
      };
    }
  },

  authorityRegister: async (authorityData: AuthorityRegisterData): Promise<ApiResponse> => {
    const response = await api.post('/api/authority/register', authorityData);
    return response.data;
  },

  getLoggedAuthority: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/api/authority/loggedAuthority');
      return {
        success: true,
        data: response.data.authority,
        message: 'Authority data retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to get authority data'
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  },
};