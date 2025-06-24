import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import cartService, { CartItem, CartSummary } from "@/services/cartService";
import { useAuth } from "./AuthContext";
import { isApiSuccess } from "@/utils/apiUtils";

interface CartContextType {
  cartItems: CartItem[];
  cartSummary: CartSummary;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    total_items: 0,
    total_amount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart items when user is authenticated
  const refreshCart = async () => {
    if (!isAuthenticated || !user) {
      setCartItems([]);
      setCartSummary({ total_items: 0, total_amount: 0 });
      return;
    }

    setIsLoading(true);
    try {
      const response = await cartService.getCart();
      if (isApiSuccess(response) && response.data) {
        setCartItems(response.data.cart_items);
        setCartSummary(response.data.summary);
      } else {
        setCartItems([]);
        setCartSummary({ total_items: 0, total_amount: 0 });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      setCartSummary({ total_items: 0, total_amount: 0 });
    } finally {
      setIsLoading(false);
    }
  }; // Add item to cart
  const addToCart = async (
    productId: number,
    quantity: number = 1
  ): Promise<boolean> => {
    console.log("🛒 Adding to cart:", {
      productId,
      quantity,
      isAuthenticated,
      user: user?.id,
    });

    if (!isAuthenticated) {
      console.error("❌ User not authenticated");
      return false;
    }

    try {
      console.log("📡 Calling cartService.addToCart...");
      const response = await cartService.addToCart({
        product_id: productId,
        quantity,
      });

      console.log("📡 Cart API response:", response);

      if (isApiSuccess(response)) {
        console.log("✅ Successfully added to cart, refreshing...");
        await refreshCart(); // Refresh cart to get updated data
        return true;
      } else {
        console.error("❌ API error adding to cart:", response);
      }
      return false;
    } catch (error: any) {
      console.error("❌ Error adding to cart:", {
        error: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        full: error,
      });

      // Retry once with a delay if the first attempt failed
      try {
        console.log("🔄 Retrying add to cart operation...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        const retryResponse = await cartService.addToCart({
          product_id: productId,
          quantity,
        });

        console.log("🔄 Retry response:", retryResponse);

        if (isApiSuccess(retryResponse)) {
          console.log("✅ Retry successful, refreshing cart...");
          await refreshCart();
          return true;
        }
      } catch (retryError: any) {
        console.error("❌ Retry also failed:", {
          error: retryError?.message,
          response: retryError?.response?.data,
          status: retryError?.response?.status,
        });
      }
      return false;
    }
  };

  // Update item quantity
  const updateQuantity = async (
    cartItemId: number,
    quantity: number
  ): Promise<boolean> => {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    try {
      const response = await cartService.updateCartItem(cartItemId, {
        quantity,
      });
      if (isApiSuccess(response)) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating cart item:", error);
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: number): Promise<boolean> => {
    try {
      const response = await cartService.removeFromCart(cartItemId);
      if (isApiSuccess(response)) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing from cart:", error);
      return false;
    }
  };

  // Clear entire cart
  const clearCart = async (): Promise<boolean> => {
    try {
      const response = await cartService.clearCart();
      if (isApiSuccess(response)) {
        setCartItems([]);
        setCartSummary({ total_items: 0, total_amount: 0 });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  };

  // Get cart count
  const getCartCount = (): number => {
    return cartSummary.total_items;
  };

  // Load cart when user authentication state changes
  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, user]);

  const value: CartContextType = {
    cartItems,
    cartSummary,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
