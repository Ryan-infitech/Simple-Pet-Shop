import api from "./api";
import {
  ApiResponse,
  Product,
  Service,
  ProductsResponse,
  ServicesResponse,
} from "@/types/api";

export interface AdminStats {
  totalServices: number;
  totalProducts: number;
  totalBookings: number;
  monthlyRevenue: number;
}

export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
  duration: string;
  category?: string;
  is_available?: boolean;
  image?: File;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id?: number;
  is_active?: boolean;
  is_featured?: boolean;
  image?: File;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
}

const adminService = {
  // Dashboard Statistics
  getDashboardStats: (): Promise<AdminStats> =>
    api
      .get<ApiResponse<AdminStats>>("/admin/stats")
      .then((response) => response.data),

  // Service Management
  getServices: (params: any = {}) =>
    api.get<ApiResponse<ServicesResponse>>("/services", params),

  createService: (data: CreateServiceData) => {
    if (data.image) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value instanceof File ? value : String(value));
        }
      });
      return api.upload<ApiResponse<Service>>("/services", formData);
    } else {
      const { image, ...serviceData } = data;
      return api.post<ApiResponse<Service>>("/services", serviceData);
    }
  },

  updateService: (data: UpdateServiceData) => {
    const { id, image, ...updateData } = data;
    if (image) {
      const formData = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      formData.append("image", image);
      return api.upload<ApiResponse<Service>>(`/services/${id}`, formData);
    } else {
      return api.put<ApiResponse<Service>>(`/services/${id}`, updateData);
    }
  },

  deleteService: (id: number) =>
    api.delete<ApiResponse<{ message: string }>>(`/services/${id}`),

  // Product Management
  getProducts: (params: any = {}) =>
    api.get<ApiResponse<ProductsResponse>>("/products", params),

  createProduct: (data: CreateProductData) => {
    if (data.image) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value instanceof File ? value : String(value));
        }
      });
      return api.upload<ApiResponse<Product>>("/products", formData);
    } else {
      const { image, ...productData } = data;
      return api.post<ApiResponse<Product>>("/products", productData);
    }
  },

  updateProduct: (data: UpdateProductData) => {
    const { id, image, ...updateData } = data;
    if (image) {
      const formData = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      formData.append("image", image);
      return api.upload<ApiResponse<Product>>(`/products/${id}`, formData);
    } else {
      return api.put<ApiResponse<Product>>(`/products/${id}`, updateData);
    }
  },

  deleteProduct: (id: number) =>
    api.delete<ApiResponse<{ message: string }>>(`/products/${id}`),

  // Category Management
  getCategories: () =>
    api.get<ApiResponse<{ categories: any[] }>>("/categories"),
};

export default adminService;
