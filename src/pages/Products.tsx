
import { useState } from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const products = [
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
    },
    {
      id: "4",
      name: "Anti-Flea Shampoo",
      price: 85000,
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
      category: "Perawatan",
      rating: 4.7,
      inStock: true
    },
    {
      id: "5",
      name: "Cat Treats Salmon",
      price: 45000,
      image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400",
      category: "Makanan",
      rating: 4.5,
      inStock: true
    },
    {
      id: "6",
      name: "Dog Vitamin Complex",
      price: 180000,
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
      category: "Vitamin",
      rating: 4.8,
      inStock: true
    }
  ];

  const categories = [
    { value: "all", label: "Semua Kategori" },
    { value: "Makanan", label: "Makanan" },
    { value: "Vitamin", label: "Vitamin & Obat" },
    { value: "Perawatan", label: "Perawatan" },
    { value: "Mainan", label: "Mainan" },
    { value: "Aksesoris", label: "Aksesoris" }
  ];

  const sortOptions = [
    { value: "name", label: "Nama A-Z" },
    { value: "price-low", label: "Harga Terendah" },
    { value: "price-high", label: "Harga Tertinggi" },
    { value: "rating", label: "Rating Tertinggi" }
  ];

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || product.category === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Produk Kami</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Temukan produk terbaik untuk hewan peliharaan kesayangan Anda
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-card/50 rounded-lg backdrop-blur border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Menampilkan {filteredProducts.length} dari {products.length} produk
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold mb-2">Produk tidak ditemukan</p>
            <p className="text-muted-foreground mb-6">
              Coba ubah kata kunci pencarian atau filter Anda
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}>
              Reset Pencarian
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Muat Lebih Banyak
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
