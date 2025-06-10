
import { ArrowRight, Shield, Heart, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const featuredProducts = [
    {
      id: "1",
      name: "Royal Canin Adult Cat Food",
      price: 285000,
      image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400",
      category: "Makanan",
      rating: 4.8,
      inStock: true
    },
    {
      id: "2", 
      name: "Vitamin Kucing Premium",
      price: 145000,
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
      category: "Vitamin",
      rating: 4.6,
      inStock: true
    },
    {
      id: "3",
      name: "Dog Food Premium",
      price: 320000,
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
      category: "Makanan",
      rating: 4.9,
      inStock: false
    }
  ];

  const featuredServices = [
    {
      id: "1",
      name: "Full Grooming Package",
      description: "Mandi, potong kuku, bersihkan telinga, dan styling rambut",
      price: 150000,
      duration: "2-3 jam",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
      rating: 4.9,
      available: true
    },
    {
      id: "2",
      name: "Vaksinasi Lengkap",
      description: "Vaksin dasar dan booster untuk perlindungan optimal",
      price: 250000,
      duration: "30 menit",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
      rating: 4.8,
      available: true
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-pink-soft">
        <div className="container py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Sayang Hewan,
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {" "}Sayang Keluarga
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Petshop terpercaya dengan produk berkualitas tinggi dan layanan profesional untuk hewan kesayangan Anda.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="gradient-pink text-primary-foreground"
                  onClick={() => navigate("/products")}
                >
                  Belanja Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => navigate("/services")}
                >
                  Lihat Layanan
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">Pelanggan Setia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Produk Tersedia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.9</div>
                  <div className="text-sm text-muted-foreground">Rating Pelanggan</div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-in">
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600"
                alt="Happy pets"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">4.9/5</span>
                  <span className="text-sm text-muted-foreground">Rating Terbaik</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Mengapa Memilih Kami?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kami berkomitmen memberikan yang terbaik untuk hewan peliharaan Anda dengan standar kualitas tertinggi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur hover:shadow-lg transition-all">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 gradient-pink rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Produk Berkualitas</h3>
                <p className="text-muted-foreground">
                  Semua produk telah tersertifikasi dan aman untuk hewan peliharaan Anda.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur hover:shadow-lg transition-all">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 gradient-pink rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Pelayanan Terbaik</h3>
                <p className="text-muted-foreground">
                  Tim profesional yang berpengalaman dan mencintai hewan.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur hover:shadow-lg transition-all">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 gradient-pink rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Layanan 24/7</h3>
                <p className="text-muted-foreground">
                  Siap membantu Anda kapan saja untuk kebutuhan darurat.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Produk Unggulan</h2>
              <p className="text-muted-foreground">Produk terlaris dan paling direkomendasikan</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/products")}>
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Layanan Profesional</h2>
              <p className="text-muted-foreground">Layanan terbaik dari tim yang berpengalaman</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/services")}>
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-pink text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bergabunglah dengan Keluarga Besar Kami
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Dapatkan penawaran khusus dan tips perawatan hewan langsung ke email Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-3 rounded-lg text-foreground"
            />
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
            >
              Berlangganan
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
