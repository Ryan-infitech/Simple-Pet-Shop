
import { Cat, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cat className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            petshop_viiona
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
          <Button variant="ghost" onClick={() => navigate("/products")}>Produk</Button>
          <Button variant="ghost" onClick={() => navigate("/services")}>Layanan</Button>
          <Button variant="ghost" onClick={() => navigate("/about")}>Tentang</Button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              2
            </Badge>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/customer")}>
            <User className="h-5 w-5" />
          </Button>
          <Button className="hidden md:inline-flex gradient-pink text-primary-foreground">
            Masuk
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container py-4 flex flex-col space-y-2">
            <Button variant="ghost" className="justify-start" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigate("/products")}>
              Produk
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigate("/services")}>
              Layanan
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigate("/about")}>
              Tentang
            </Button>
            <Button className="gradient-pink text-primary-foreground mt-4">
              Masuk
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
