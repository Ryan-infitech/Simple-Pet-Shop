import { useState } from "react";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartSummary, isLoading, updateQuantity, removeFromCart } =
    useCart();
  const { toast } = useToast();
  const [updatingItems, setUpdatingItems] = useState<{
    [key: number]: boolean;
  }>({});

  const handleUpdateQuantity = async (
    cartItemId: number,
    newQuantity: number
  ) => {
    setUpdatingItems((prev) => ({ ...prev, [cartItemId]: true }));
    try {
      const success = await updateQuantity(cartItemId, newQuantity);
      if (!success) {
        toast({
          title: "Gagal",
          description: "Tidak dapat mengupdate jumlah item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupdate jumlah",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    setUpdatingItems((prev) => ({ ...prev, [cartItemId]: true }));
    try {
      const success = await removeFromCart(cartItemId);
      if (success) {
        toast({
          title: "Berhasil",
          description: "Item berhasil dihapus dari keranjang",
        });
      } else {
        toast({
          title: "Gagal",
          description: "Tidak dapat menghapus item dari keranjang",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus item",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  const subtotal = cartSummary.total_amount;
  const tax = subtotal * 0.11; // 11% PPN
  const shipping = cartItems.length > 0 ? 25000 : 0;
  const total = subtotal + tax + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-rose-50/30">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <Loader2 className="h-24 w-24 text-muted-foreground mx-auto mb-6 animate-spin" />
              <h1 className="text-3xl font-bold mb-4">Memuat Keranjang...</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Sedang mengambil data keranjang Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-rose-50/30">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Keranjang Kosong</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Belum ada produk di keranjang Anda. Mari mulai berbelanja untuk
                hewan kesayangan!
              </p>
              <div className="space-y-4">
                <Button
                  size="lg"
                  className="gradient-purple text-white"
                  onClick={() => navigate("/products")}
                >
                  Mulai Berbelanja
                </Button>
                <br />
                <Button variant="outline" onClick={() => navigate("/")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-rose-50/30">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Keranjang Belanja</h1>
              <p className="text-muted-foreground">
                {cartItems.length} item dalam keranjang
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card
                  key={item.id}
                  className="border-0 bg-card/50 backdrop-blur"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.svg";
                          }}
                        />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Stok: {item.stock_quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              Rp {item.price.toLocaleString("id-ID")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              per item
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              disabled={
                                updatingItems[item.id] || item.quantity <= 1
                              }
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              {updatingItems[item.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              disabled={
                                updatingItems[item.id] ||
                                item.quantity >= item.stock_quantity
                              }
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              {updatingItems[item.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">
                                Rp {item.subtotal.toLocaleString("id-ID")}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              disabled={updatingItems[item.id]}
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              {updatingItems[item.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border-0 bg-card/50 backdrop-blur sticky top-6">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal ({cartSummary.total_items} item)</span>
                      <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkos Kirim</span>
                      <span>Rp {shipping.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PPN (11%)</span>
                      <span>Rp {tax.toLocaleString("id-ID")}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        Rp {total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full gradient-purple text-white"
                      size="lg"
                      onClick={() => navigate("/payment")}
                    >
                      Bayar Sekarang
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/products")}
                    >
                      Lanjut Belanja
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
