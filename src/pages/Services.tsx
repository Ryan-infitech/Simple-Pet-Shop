
import { useState } from "react";
import { Calendar, Clock, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ServiceCard from "@/components/ServiceCard";

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const services = [
    {
      id: "1",
      name: "Full Grooming Package",
      description: "Mandi, potong kuku, bersihkan telinga, dan styling rambut dengan produk premium",
      price: 150000,
      duration: "2-3 jam",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
      rating: 4.9,
      available: true
    },
    {
      id: "2",
      name: "Vaksinasi Lengkap",
      description: "Vaksin dasar dan booster untuk perlindungan optimal dari berbagai penyakit",
      price: 250000,
      duration: "30 menit",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
      rating: 4.8,
      available: true
    },
    {
      id: "3",
      name: "Pet Spa Treatment",
      description: "Perawatan spa mewah dengan aromaterapi dan pijat relaksasi",
      price: 200000,
      duration: "1-2 jam",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
      rating: 4.7,
      available: false
    },
    {
      id: "4",
      name: "Konsultasi Dokter Hewan",
      description: "Konsultasi kesehatan lengkap dengan dokter hewan berpengalaman",
      price: 100000,
      duration: "45 menit",
      image: "https://images.unsplash.com/photo-1559190394-fd9a71c8bf47?w=400",
      rating: 4.9,
      available: true
    },
    {
      id: "5",
      name: "Perawatan Gigi",
      description: "Pembersihan dan perawatan gigi profesional untuk kesehatan mulut",
      price: 180000,
      duration: "1 jam",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
      rating: 4.6,
      available: true
    },
    {
      id: "6",
      name: "Pet Hotel",
      description: "Penitipan hewan dengan fasilitas lengkap dan perawatan 24 jam",
      price: 75000,
      duration: "Per hari",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
      rating: 4.8,
      available: true
    }
  ];

  const categories = [
    { value: "all", label: "Semua Layanan" },
    { value: "grooming", label: "Grooming" },
    { value: "kesehatan", label: "Kesehatan" },
    { value: "perawatan", label: "Perawatan" },
    { value: "hotel", label: "Pet Hotel" }
  ];

  const getServiceCategory = (serviceName: string) => {
    if (serviceName.toLowerCase().includes("grooming") || serviceName.toLowerCase().includes("spa")) return "grooming";
    if (serviceName.toLowerCase().includes("vaksin") || serviceName.toLowerCase().includes("konsult") || serviceName.toLowerCase().includes("gigi")) return "kesehatan";
    if (serviceName.toLowerCase().includes("hotel")) return "hotel";
    return "perawatan";
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "all" || getServiceCategory(service.name) === selectedCategory)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Layanan Kami</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Layanan profesional dengan standar terbaik untuk hewan peliharaan Anda
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
              <h3 className="text-xl font-semibold mb-2">Butuh booking cepat?</h3>
              <p className="text-muted-foreground">Hubungi kami langsung untuk reservasi atau konsultasi</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="gradient-pink text-primary-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Booking Sekarang
              </Button>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Hubungi Kami
              </Button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Menampilkan {filteredServices.length} dari {services.length} layanan
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold mb-2">Layanan tidak ditemukan</p>
            <p className="text-muted-foreground mb-6">
              Coba ubah kata kunci pencarian atau kategori Anda
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}>
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
                Senin - Sabtu: 08:00 - 20:00<br />
                Minggu: 09:00 - 17:00
              </p>
            </div>
            <div>
              <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Booking</h3>
              <p className="text-sm text-muted-foreground">
                Reservasi disarankan 1-2 hari sebelumnya<br />
                untuk memastikan ketersediaan slot
              </p>
            </div>
            <div>
              <Filter className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Persyaratan</h3>
              <p className="text-sm text-muted-foreground">
                Hewan dalam kondisi sehat<br />
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
