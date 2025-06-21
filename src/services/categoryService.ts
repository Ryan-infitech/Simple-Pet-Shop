import api from "./api";
import { ApiResponse, CategoriesResponse, Category } from "@/types/api";

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  include_products?: boolean;
  [key: string]: string | number | boolean | undefined;
}

const categoryService = {
  // Mendapatkan semua kategori dengan filter dan pagination
  getCategories: (params: CategoryQueryParams = {}) =>
    api.get<ApiResponse<CategoriesResponse>>("/categories", params),

  // Mendapatkan kategori berdasarkan ID
  getCategoryById: (id: string) =>
    api.get<ApiResponse<Category>>(`/categories/${id}`),
};

export default categoryService;
