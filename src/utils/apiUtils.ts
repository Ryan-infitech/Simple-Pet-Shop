// Utils for handling API responses
import { ApiResponse } from "@/types/api";
import { toast } from "@/components/ui/use-toast";

/**
 * Handle API errors consistently across the application
 */
export const handleApiError = (error: any, customMessage?: string) => {
  console.error("API Error:", error);

  const message =
    customMessage ||
    (error?.message
      ? error.message
      : "Terjadi kesalahan. Silakan coba lagi nanti.");

  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};

/**
 * Check if API response is successful
 */
export const isApiSuccess = <T>(response: ApiResponse<T>): boolean => {
  return response.success === true && response.data !== undefined;
};

/**
 * Format currency to Indonesian Rupiah
 */
export const formatRupiah = (amount: number): string => {
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

/**
 * Parse API error to get error message
 */
export const getApiErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Terjadi kesalahan. Silakan coba lagi nanti.";
};
