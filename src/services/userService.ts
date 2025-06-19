import api from "./api";
import { ApiResponse } from "@/types/api";

export interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  activeBookings: number;
  wishlistItems: number;
}

export interface OrderHistory {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{
    id?: number;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at?: string;
}

export interface AppointmentData {
  id: number;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  pet_name?: string;
  pet_type?: string;
  notes?: string;
}

const userService = {
  // Get user profile
  getProfile: (userId: string) =>
    api.get<ApiResponse<{ user: UserProfile }>>(`/users/${userId}`),

  // Get user's orders
  getOrders: (
    params: { page?: number; limit?: number; status?: string } = {}
  ) =>
    api.get<ApiResponse<{ orders: OrderHistory[]; pagination: any }>>(
      "/orders",
      params
    ),

  // Get user's appointments/bookings
  getAppointments: (
    params: { page?: number; limit?: number; status?: string } = {}
  ) =>
    api.get<ApiResponse<{ appointments: AppointmentData[]; pagination: any }>>(
      "/appointments",
      params
    ),

  // Get dashboard stats
  getDashboardStats: async (userId: string): Promise<DashboardStats> => {
    try {
      let stats: DashboardStats = {
        totalOrders: 0,
        totalSpent: 0,
        activeBookings: 0,
        wishlistItems: 0,
      };

      // Get orders data
      const ordersResponse = await api.get<
        ApiResponse<{ orders: OrderHistory[]; pagination: any }>
      >("/orders", { limit: 100 });

      if (ordersResponse.data?.orders) {
        const orders = ordersResponse.data.orders;
        stats.totalOrders = orders.length;
        stats.totalSpent = orders.reduce(
          (sum, order) => sum + Number(order.total_amount),
          0
        );
      }

      // Get appointments data
      try {
        const appointmentsResponse = await api.get<
          ApiResponse<{ appointments: AppointmentData[]; pagination: any }>
        >("/appointments", { limit: 100 });
        if (appointmentsResponse.data?.appointments) {
          const appointments = appointmentsResponse.data.appointments;
          // Count active appointments (scheduled, confirmed)
          stats.activeBookings = appointments.filter(
            (app) => app.status === "scheduled" || app.status === "confirmed"
          ).length;
        }
      } catch (error) {
        console.log(
          "Appointments endpoint not available, skipping booking stats"
        );
        stats.activeBookings = 0;
      }

      // TODO: Add wishlist when that endpoint is available
      stats.wishlistItems = 0;

      return stats;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        activeBookings: 0,
        wishlistItems: 0,
      };
    }
  },

  // Update user profile
  updateProfile: (userId: string, data: Partial<UserProfile>) =>
    api.put<ApiResponse<{ user: UserProfile }>>(`/users/${userId}`, data),

  // Change password
  changePassword: (
    userId: string,
    data: { current_password: string; new_password: string }
  ) =>
    api.put<ApiResponse<{ message: string }>>(
      `/users/${userId}/password`,
      data
    ),
};

export default userService;
