import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Cart from "@/pages/Cart";
import Payment from "@/pages/Payment";
import CustomerDashboard from "@/pages/CustomerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import { ProductProvider } from "@/contexts/ProductContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ApiMonitor from "@/components/ApiMonitor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <ProductProvider>
          <CategoryProvider>
            <ServiceProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Router>
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/products" element={<Products />} />
                        <Route
                          path="/products/:id"
                          element={<ProductDetail />}
                        />
                        <Route path="/services" element={<Services />} />
                        <Route
                          path="/services/:id"
                          element={<ServiceDetail />}
                        />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                          path="/cart"
                          element={
                            <ProtectedRoute>
                              <Cart />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/payment"
                          element={
                            <ProtectedRoute>
                              <Payment />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/customer"
                          element={
                            <ProtectedRoute requireRole="customer">
                              <CustomerDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute requireRole="admin">
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                  {import.meta.env.DEV && <ApiMonitor />}
                </Router>
              </TooltipProvider>
            </ServiceProvider>
          </CategoryProvider>
        </ProductProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
