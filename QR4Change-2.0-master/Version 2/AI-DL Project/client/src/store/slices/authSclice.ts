import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, RegisterData, AuthorityRegisterData, User } from '../../types';
import { authService } from '../../services/authService';

const getInitialState = (): AuthState => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  let user = null;
  
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    user = null;
  }
  
  return {
    user,
    token,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'user');
        return { user: response.data.user, token: response.data.token };
      }
      return rejectWithValue(response.message || 'Login failed');
    } catch (error: any) {
      console.error('Auth slice - Login error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginAuthority = createAsyncThunk(
  'auth/loginAuthority',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.authorityLogin(credentials);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.authority));
        localStorage.setItem('userType', 'authority');
        return { user: response.data.authority, token: response.data.token };
      }
      return rejectWithValue(response.message || 'Authority login failed');
    } catch (error: any) {
      console.error('Auth slice - Authority login error:', error);
      return rejectWithValue(error.message || 'Authority login failed');
    }
  }
);

export const registerAuthority = createAsyncThunk(
  'auth/registerAuthority',
  async (authorityData: AuthorityRegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.authorityRegister(authorityData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Authority registration failed');
    }
  }
);

export const refreshUserData = createAsyncThunk(
  'auth/refreshUserData',
  async (_, { rejectWithValue }) => {
    try {
      const userType = localStorage.getItem('userType');
      let response;
      
      if (userType === 'authority') {
        response = await authService.getLoggedAuthority();
      } else {
        response = await authService.getLoggedUser();
      }
      
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh user data');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login Authority
      .addCase(loginAuthority.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAuthority.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAuthority.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register Authority
      .addCase(registerAuthority.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAuthority.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerAuthority.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh User Data
      .addCase(refreshUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Don't set isAuthenticated to false here, as the token might still be valid
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;