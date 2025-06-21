import api from "./api";
import { ApiResponse } from "@/types/api";

export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  payment_method: string;
  shipping_address: string;
  notes?: string;
}

export interface OrderResponse {
  order_id: number;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
}

export interface PaymentRequest {
  order_id: number;
  payment_method: string;
  amount: number;
}

export interface PaymentResponse {
  payment_id: number;
  status: string;
  payment_url?: string;
  reference_number: string;
}

const orderService = {
  // Create order from cart
  createOrderFromCart: (data: {
    payment_method: string;
    shipping_address: string;
    notes?: string;
  }) =>
    api
      .post<ApiResponse<OrderResponse>>("/orders/from-cart", data)
      .catch((error) => {
        console.error("Order from cart error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }),

  // Create order with specific items
  createOrder: (data: CreateOrderRequest) =>
    api.post<ApiResponse<OrderResponse>>("/orders", data),

  // Get order details
  getOrder: (orderId: number) =>
    api.get<ApiResponse<{ order: any; items: any[] }>>(`/orders/${orderId}`),

  // Process payment
  processPayment: (data: PaymentRequest) =>
    api.post<ApiResponse<PaymentResponse>>("/payments", data),

  // Get payment status
  getPaymentStatus: (paymentId: number) =>
    api.get<ApiResponse<{ payment: any }>>(`/payments/${paymentId}`),
  // Quick payment (for transfer bank - auto success)
  quickPayment: (data: {
    order_id: number;
    payment_method: string;
    amount: number;
  }) =>
    api
      .post<ApiResponse<PaymentResponse>>("/payments/quick", data)
      .catch((error) => {
        console.error("Payment processing error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }),
};

export default orderService;
