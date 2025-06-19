// Definisi tipe data untuk API

// Response umum untuk semua API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  page?: number;
  pages?: number;
  total?: number;
  limit?: number;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  category_id: number;
  category_name: string;
  image_url: string;
  is_active: number;
  rating: string;
  avg_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  // Tambahan untuk kompatibilitas frontend
  stock: number;
  images: string[];
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

// Service Types
export interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  image_url: string;
  is_available: number;
  rating: string;
  avg_rating: number;
  review_count: number;
  upcoming_appointments: number;
  created_at: string;
  updated_at: string;
}

export interface ServicesResponse {
  services: Service[];
  pagination: Pagination;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: Pagination;
}

// Cart Types
export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total_items: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
}
