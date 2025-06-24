import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Category, CategoriesResponse, ApiResponse } from "@/types/api";
import categoryService from "@/services/categoryService";
import { handleApiError, isApiSuccess } from "@/utils/apiUtils";

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refreshCategories: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await categoryService.getCategories({ limit: 100 });

      if (isApiSuccess(response)) {
        setCategories(response.data?.categories || []);
      }
    } catch (err) {
      setError("Gagal memuat kategori. Silakan coba lagi nanti.");
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories on initial load
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoading,
        error,
        refreshCategories: fetchCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
};
