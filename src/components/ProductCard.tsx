import { useState } from "react";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string | number;
  name: string;
  price: string | number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  category,
  rating,
  inStock,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleProductClick = () => {
    navigate(`/products/${id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Login Diperlukan",
        description:
          "Silakan login terlebih dahulu untuk menambah ke keranjang",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!inStock) {
      toast({
        title: "Stok Habis",
        description: "Produk ini sedang tidak tersedia",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      const success = await addToCart(Number(id), 1);
      if (success) {
        toast({
          title: "Berhasil!",
          description: `${name} ditambahkan ke keranjang`,
        });
      } else {
        toast({
          title: "Gagal",
          description: "Tidak dapat menambahkan ke keranjang",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan ke keranjang",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur">
      <div
        className="relative overflow-hidden cursor-pointer"
        onClick={handleProductClick}
      >
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            {category}
          </Badge>
        </div>
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur"
          onClick={(e) => {
            e.stopPropagation();
            // Add to wishlist functionality can be added here
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${
                    i < Math.floor(rating)
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({rating})</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              Rp {price.toLocaleString("id-ID")}
            </span>
            {!inStock && <p className="text-xs text-destructive">Stok habis</p>}
          </div>
          <Button
            size="sm"
            disabled={!inStock || isAddingToCart}
            className="gradient-pink text-primary-foreground disabled:opacity-50"
            onClick={handleAddToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-1" />
            )}
            {isAddingToCart ? "Loading..." : "Beli"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
