import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Service, ServicesResponse, ApiResponse } from "@/types/api";
import serviceService from "@/services/serviceService";
import { handleApiError, isApiSuccess } from "@/utils/apiUtils";

interface ServiceContextType {
  featuredServices: Service[];
  allServices: Service[];
  isLoading: boolean;
  error: string | null;
  refreshServices: () => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch featured services
      const featuredResponse = await serviceService.getFeaturedServices(4);

      if (isApiSuccess(featuredResponse)) {
        setFeaturedServices(featuredResponse.data?.services || []);
      }

      // Fetch all services
      const allResponse = await serviceService.getServices({ limit: 100 });

      if (isApiSuccess(allResponse)) {
        setAllServices(allResponse.data?.services || []);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Gagal memuat layanan. Silakan coba lagi nanti.");
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch services on initial load
  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <ServiceContext.Provider
      value={{
        featuredServices,
        allServices,
        isLoading,
        error,
        refreshServices: fetchServices,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return context;
};
