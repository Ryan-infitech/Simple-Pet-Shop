import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Heart, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import { useProducts } from "@/contexts/ProductContext";
import { useServices } from "@/contexts/ServiceContext";
import { Product, Service } from "@/types/api";

const Home = () => {
  const navigate = useNavigate();
  const {
    featuredProducts,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();
  const {
    featuredServices,
    isLoading: servicesLoading,
    error: servicesError,
  } = useServices();

  const isLoading = productsLoading || servicesLoading;
  const error = productsError || servicesError;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-pink-soft">
        <div className="container py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Sayang Hewan,
                  <span className="bg-gradient-to-r from-purple-600 via-rose-500 to-purple-700 bg-clip-text text-transparent">
                    {" "}
                    Sayang Keluarga
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Petshop terpercaya dengan produk berkualitas tinggi dan
                  layanan profesional untuk hewan kesayangan Anda.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="gradient-purple text-white"
                  onClick={() => navigate("/products")}
                >
                  Belanja Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => navigate("/services")}
                >
                  Lihat Layanan
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">
                    Pelanggan Setia
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">
                    Produk Tersedia
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.9</div>
                  <div className="text-sm text-muted-foreground">
                    Rating Pelanggan
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-in">
              <img
                src="https://images.unsplash.com/photo-1603451757941-b11957205f69?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Happy pets"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-orange-400 fill-current" />
                  <span className="font-semibold">4.9/5</span>
                  <span className="text-sm text-muted-foreground">
                    Rating Terbaik
                  </span>
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
              Kami berkomitmen memberikan yang terbaik untuk hewan peliharaan
              Anda dengan standar kualitas tertinggi.
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
                  Semua produk telah tersertifikasi dan aman untuk hewan
                  peliharaan Anda.
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
              <p className="text-muted-foreground">
                Produk terlaris dan paling direkomendasikan
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/products")}>
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {productsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="p-4 h-96 animate-pulse">
                  <div className="h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </Card>
              ))}
            </div>
          ) : productsError ? (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-destructive mb-4">{productsError}</p>
              <Button onClick={() => window.location.reload()}>
                Coba Lagi
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id.toString()}
                  name={product.name}
                  price={parseFloat(product.price)}
                  image={product.image_url || "/placeholder.svg"}
                  category={product.category_name}
                  rating={
                    product.avg_rating || parseFloat(product.rating || "0")
                  }
                  inStock={product.stock_quantity > 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Layanan Profesional</h2>
              <p className="text-muted-foreground">
                Layanan terbaik dari tim yang berpengalaman
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/services")}>
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {servicesLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((n) => (
                <Card key={n} className="p-4 h-64 animate-pulse">
                  <div className="h-36 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </Card>
              ))}
            </div>
          ) : servicesError ? (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-destructive mb-4">{servicesError}</p>
              <Button onClick={() => window.location.reload()}>
                Coba Lagi
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {featuredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id.toString()}
                  name={service.name}
                  description={service.description}
                  price={parseFloat(service.price)}
                  duration={`${service.duration} menit`}
                  image={service.image_url || "/placeholder.svg"}
                  rating={
                    service.avg_rating || parseFloat(service.rating || "0")
                  }
                  available={service.is_available === 1}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-purple text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bergabunglah dengan Keluarga Besar Kami
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Dapatkan penawaran khusus dan tips perawatan hewan langsung ke email
            Anda.
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
              className="bg-white text-purple-700 hover:bg-purple-50"
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
