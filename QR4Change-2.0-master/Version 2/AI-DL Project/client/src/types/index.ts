export interface User {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'authority';
  city?: string;
  tc?: boolean;
}

export interface Authority extends User {
  role: 'authority';
  city: string;
  department: string;
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: 'Garbage' | 'Pothole' | 'Street Light' | 'Water Supply' | 'Others';
  location: string;
  city: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  imageUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  feedback?: string;
  aiValidation?: {
    isValid: boolean;
    confidence: number;
    detectedCategory?: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ComplaintState {
  complaints: Complaint[];
  currentComplaint: Complaint | null;
  loading: boolean;
  error: string | null;
  filters: {
    city: string;
    category: string;
    status: string;
    urgency: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  password_confirmation: string;
  tc: boolean;
}

export interface AuthorityRegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  city: string;
}

export interface ComplaintFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  urgency: string;
  image?: File;
}