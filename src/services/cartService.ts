import api from "./api";
import { ApiResponse } from "@/types/api";

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image?: string;
  stock_quantity: number;
  is_active: boolean;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface CartSummary {
  total_items: number;
  total_amount: number;
}

export interface CartData {
  cart_items: CartItem[];
  summary: CartSummary;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

const cartService = {
  // Get cart items
  getCart: () => api.get<ApiResponse<CartData>>("/cart"),
  // Add item to cart
  addToCart: (data: AddToCartRequest) => {
    console.log("🛒 CartService.addToCart called with:", data);
    return api
      .post<
        ApiResponse<{
          action: string;
          quantity?: number;
          cart_item_id?: number;
        }>
      >("/cart", data)
      .catch((error) => {
        // Log detailed error info
        console.error("❌ Cart API error details:", {
          url: "/cart",
          method: "POST",
          data: data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          message: error.message,
          headers: error.response?.headers,
        });
        throw error;
      });
  },

  // Update cart item quantity
  updateCartItem: (cartItemId: number, data: UpdateCartRequest) =>
    api.put<ApiResponse<{ action: string; quantity: number }>>(
      `/cart/${cartItemId}`,
      data
    ),
  // Remove item from cart
  removeFromCart: (cartItemId: number) =>
    api
      .delete<ApiResponse<{ message: string }>>(`/cart/${cartItemId}`)
      .catch((error) => {
        console.error("Remove from cart error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }),

  // Clear entire cart
  clearCart: () =>
    api.delete<ApiResponse<{ message: string }>>("/cart").catch((error) => {
      console.error("Clear cart error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }),

  // Get cart count (for header display)
  getCartCount: async (): Promise<number> => {
    try {
      const response = await api.get<ApiResponse<CartData>>("/cart");
      if (response.success && response.data) {
        return response.data.summary.total_items;
      }
      return 0;
    } catch (error) {
      console.error("Error getting cart count:", error);
      return 0;
    }
  },
};

export default cartService;
