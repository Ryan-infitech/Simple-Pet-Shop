import api from "./api";
import { ApiResponse, Product, ProductsResponse } from "@/types/api";

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  is_featured?: boolean;
  [key: string]: string | number | boolean | undefined;
}

const productService = {
  // Mendapatkan semua produk dengan filter dan pagination
  getProducts: (params: ProductQueryParams = {}) =>
    api.get<ApiResponse<ProductsResponse>>("/products", params),
  // Mendapatkan produk unggulan
  getFeaturedProducts: (limit = 3) =>
    api.get<ApiResponse<ProductsResponse>>("/products", {
      is_featured: true,
      limit,
    }),

  // Mendapatkan produk berdasarkan ID
  getProductById: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),

  // Mendapatkan produk berdasarkan kategori
  getProductsByCategory: (
    categoryId: string,
    params: ProductQueryParams = {}
  ) =>
    api.get<ApiResponse<ProductsResponse>>("/products", {
      ...params,
      category: categoryId,
    }),

  // Mencari produk berdasarkan kata kunci
  searchProducts: (keyword: string, params: ProductQueryParams = {}) =>
    api.get<ApiResponse<ProductsResponse>>("/products", {
      ...params,
      search: keyword,
    }),

  // Mendapatkan produk terkait berdasarkan kategori
  getRelatedProducts: (productId: string, limit = 4) =>
    api.get<ApiResponse<ProductsResponse>>("/products/related", {
      product_id: productId,
      limit,
    }),
};

export default productService;
