import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Product, ProductsResponse, ApiResponse } from "@/types/api";
import productService, { ProductQueryParams } from "@/services/productService";
import { handleApiError, isApiSuccess } from "@/utils/apiUtils";

interface ProductContextType {
  featuredProducts: Product[];
  latestProducts: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch featured products
      console.log("Fetching featured products...");
      const featuredResponse = await productService.getFeaturedProducts(6);
      console.log("Featured products response:", featuredResponse);

      if (isApiSuccess(featuredResponse)) {
        console.log(
          "Setting featured products:",
          featuredResponse.data?.products
        );
        setFeaturedProducts(featuredResponse.data?.products || []);
      }

      // Fetch latest products
      console.log("Fetching latest products...");
      const latestResponse = await productService.getProducts({
        limit: 8,
        sort_by: "created_at",
        sort_order: "DESC",
      });
      console.log("Latest products response:", latestResponse);

      if (isApiSuccess(latestResponse)) {
        console.log("Setting latest products:", latestResponse.data?.products);
        setLatestProducts(latestResponse.data?.products || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Gagal memuat produk. Silakan coba lagi nanti.");
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products on initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        featuredProducts,
        latestProducts,
        isLoading,
        error,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
