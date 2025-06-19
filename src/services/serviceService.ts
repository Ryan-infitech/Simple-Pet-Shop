import api from "./api";
import { ApiResponse, Service, ServicesResponse } from "@/types/api";

export interface ServiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  [key: string]: string | number | boolean | undefined;
}

const serviceService = {
  // Mendapatkan semua layanan dengan filter dan pagination
  getServices: (params: ServiceQueryParams = {}) =>
    api.get<ApiResponse<ServicesResponse>>("/services", params),

  // Mendapatkan layanan unggulan
  getFeaturedServices: (limit = 2) =>
    api.get<ApiResponse<ServicesResponse>>("/services", {
      sort_by: "rating",
      sort_order: "DESC",
      limit,
    }),

  // Mendapatkan layanan berdasarkan ID
  getServiceById: (id: string) =>
    api.get<ApiResponse<Service>>(`/services/${id}`),

  // Mencari layanan berdasarkan kata kunci
  searchServices: (keyword: string, params: ServiceQueryParams = {}) =>
    api.get<ApiResponse<ServicesResponse>>("/services", {
      ...params,
      search: keyword,
    }),
};

export default serviceService;
