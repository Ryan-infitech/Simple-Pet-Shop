import { Cat, ShoppingCart, User, Menu, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import ApiStatus from "./ApiStatus";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { getCartCount } = useCart();

  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center justify-between">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Cat className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            petshop_viiona
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button variant="ghost" onClick={() => navigate("/products")}>
            Produk
          </Button>
          <Button variant="ghost" onClick={() => navigate("/services")}>
            Layanan
          </Button>
          <Button variant="ghost" onClick={() => navigate("/about")}>
            Tentang
          </Button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <ApiStatus className="hidden md:flex mr-2" />
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </Button>

          {/* User Menu or Auth Buttons */}
          {isLoading ? (
            <div className="hidden md:flex items-center space-x-2">
              <div className="h-9 w-16 bg-muted rounded animate-pulse"></div>
              <div className="h-9 w-16 bg-muted rounded animate-pulse"></div>
            </div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.full_name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/customer")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Masuk
              </Button>
              <Button
                className="gradient-pink text-primary-foreground"
                onClick={() => navigate("/register")}
              >
                Daftar
              </Button>
            </div>
          )}

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
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => navigate("/")}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => navigate("/products")}
            >
              Produk
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => navigate("/services")}
            >
              Layanan
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => navigate("/about")}
            >
              Tentang
            </Button>
            <div className="flex flex-col space-y-2 pt-4">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium">{user?.full_name}</p>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigate("/customer")}
                  >
                    Dashboard
                  </Button>
                  {user?.role === "admin" && (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate("/admin")}
                    >
                      Admin Panel
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    Masuk
                  </Button>
                  <Button
                    className="gradient-pink text-primary-foreground"
                    onClick={() => navigate("/register")}
                  >
                    Daftar
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
