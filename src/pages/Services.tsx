import { useState, useEffect } from "react";
import { Calendar, Clock, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ServiceCard from "@/components/ServiceCard";
import { Service } from "@/types/api";
import serviceService from "@/services/serviceService";
import { isApiSuccess } from "@/utils/apiUtils";

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: any = {};

        // Add search term if provided
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        const response = await serviceService.getServices(params);

        if (isApiSuccess(response) && response.data) {
          setServices(response.data.services || []);
        } else {
          setError("Gagal memuat layanan");
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Gagal memuat layanan. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(
      () => {
        fetchServices();
      },
      searchTerm ? 500 : 0
    );

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const categories = [
    { value: "all", label: "Semua Layanan" },
    { value: "grooming", label: "Grooming" },
    { value: "kesehatan", label: "Kesehatan" },
    { value: "perawatan", label: "Perawatan" },
    { value: "hotel", label: "Pet Hotel" },
  ];
  const getServiceCategory = (serviceName: string) => {
    if (
      serviceName.toLowerCase().includes("grooming") ||
      serviceName.toLowerCase().includes("spa")
    )
      return "grooming";
    if (
      serviceName.toLowerCase().includes("vaksin") ||
      serviceName.toLowerCase().includes("konsult") ||
      serviceName.toLowerCase().includes("gigi")
    )
      return "kesehatan";
    if (serviceName.toLowerCase().includes("hotel")) return "hotel";
    return "perawatan";
  };
  const filteredServices = services.filter(
    (service) =>
      selectedCategory === "all" ||
      getServiceCategory(service.name) === selectedCategory
  );

  // Transform API data to match ServiceCard props
  const transformedServices = filteredServices.map((service) => ({
    id: String(service.id),
    name: service.name,
    description: service.description,
    price: Number(service.price),
    duration: service.duration,
    image: service.image_url,
    rating: Number(service.rating),
    available: service.is_available === 1,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Layanan Kami</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Layanan profesional dengan standar terbaik untuk hewan peliharaan
            Anda
          </p>
        </div>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-card/50 rounded-lg backdrop-blur border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari layanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        {/* Quick Booking */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 mb-8 border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Butuh booking cepat?
              </h3>
              <p className="text-muted-foreground">
                Hubungi kami langsung untuk reservasi atau konsultasi
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="gradient-purple text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Booking Sekarang
              </Button>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Hubungi Kami
              </Button>
            </div>
          </div>
        </div>{" "}
        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Menampilkan {transformedServices.length} dari {services.length}{" "}
            layanan
          </p>
        </div>
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold mb-2 text-destructive">
              {error}
            </p>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </div>
        )}
        {/* Services Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedServices.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        )}
        {/* Empty State */}
        {!loading &&
          !error &&
          transformedServices.length === 0 &&
          services.length > 0 && (
            <div className="text-center py-16">
              <p className="text-2xl font-semibold mb-2">
                Layanan tidak ditemukan
              </p>
              <p className="text-muted-foreground mb-6">
                Coba ubah kata kunci pencarian atau kategori Anda
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
              >
                Reset Pencarian
              </Button>
            </div>
          )}
        {/* Service Info */}
        <div className="mt-16 bg-secondary/30 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Informasi Penting</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Jam Operasional</h3>
              <p className="text-sm text-muted-foreground">
                Senin - Sabtu: 08:00 - 20:00
                <br />
                Minggu: 09:00 - 17:00
              </p>
            </div>
            <div>
              <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Booking</h3>
              <p className="text-sm text-muted-foreground">
                Reservasi disarankan 1-2 hari sebelumnya
                <br />
                untuk memastikan ketersediaan slot
              </p>
            </div>
            <div>
              <Filter className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Persyaratan</h3>
              <p className="text-sm text-muted-foreground">
                Hewan dalam kondisi sehat
                <br />
                Bawa kartu vaksin untuk layanan tertentu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
