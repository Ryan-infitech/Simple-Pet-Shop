
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
}

const ProductCard = ({ name, price, image, category, rating, inStock }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {category}
          </Badge>
        </div>
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur"
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
                  className={`text-xs ${i < Math.floor(rating) ? 'text-primary' : 'text-muted-foreground'}`}
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
              Rp {price.toLocaleString('id-ID')}
            </span>
            {!inStock && (
              <p className="text-xs text-destructive">Stok habis</p>
            )}
          </div>
          <Button
            size="sm"
            disabled={!inStock}
            className="gradient-pink text-primary-foreground disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Beli
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
