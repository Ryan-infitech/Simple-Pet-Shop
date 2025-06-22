import { useState, useEffect } from "react";
import { Building2, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import orderService from "@/services/orderService";

const Payment = () => {
  const navigate = useNavigate();
  const { cartItems, cartSummary, clearCart } = useCart();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Calculate totals
  const subtotal = cartSummary.total_amount;
  const tax = subtotal * 0.11; // 11% PPN
  const shipping = cartItems.length > 0 ? 25000 : 0;
  const total = subtotal + tax + shipping;

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !isSuccess) {
      toast({
        title: "Keranjang Kosong",
        description: "Tidak ada item dalam keranjang untuk dibayar",
        variant: "destructive",
      });
      navigate("/cart");
    }
  }, [cartItems.length, isSuccess, navigate, toast]);
  const handlePayment = async () => {
    if (!shippingAddress.trim()) {
      toast({
        title: "Alamat Pengiriman Diperlukan",
        description: "Silakan masukkan alamat pengiriman",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log("Creating order with payment method:", paymentMethod);

      // Create order from cart
      const orderResponse = await orderService.createOrderFromCart({
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        notes: notes,
      });

      if (!orderResponse || !orderResponse.success) {
        console.error("Failed to create order:", orderResponse);
        toast({
          title: "Gagal Membuat Pesanan",
          description:
            "Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (orderResponse.success && orderResponse.data) {
        const orderId = orderResponse.data.order_id; // Process payment (auto-success for bank transfer)
        // Make sure to normalize payment method names
        const normalizedPaymentMethod =
          paymentMethod === "bank-transfer" ? "transfer_bank" : paymentMethod;

        console.log("Processing payment with method:", normalizedPaymentMethod);

        const paymentResponse = await orderService.quickPayment({
          order_id: orderId,
          payment_method: normalizedPaymentMethod,
          amount: total,
        });

        if (paymentResponse.success) {
          setOrderResult({
            ...orderResponse.data,
            payment: paymentResponse.data,
          });
          setIsSuccess(true);

          // Clear cart after successful payment
          await clearCart();

          toast({
            title: "Pembayaran Berhasil!",
            description: "Pesanan Anda telah berhasil diproses",
          });
        } else {
          throw new Error("Payment processing failed");
        }
      } else {
        throw new Error("Order creation failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Pembayaran Gagal",
        description:
          error.response?.data?.message ||
          "Terjadi kesalahan saat memproses pembayaran",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess && orderResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-rose-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-0 bg-card/80 backdrop-blur">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h2>
            <p className="text-muted-foreground mb-4">
              Terima kasih! Pesanan Anda telah berhasil diproses.
            </p>
            <div className="text-sm text-muted-foreground mb-6 space-y-1">
              <p>
                Nomor Pesanan:{" "}
                <span className="font-mono">{orderResult.order_number}</span>
              </p>
              <p>
                Referensi Pembayaran:{" "}
                <span className="font-mono">
                  {orderResult.payment?.reference_number}
                </span>
              </p>
              <p>
                Total:{" "}
                <span className="font-semibold">
                  Rp {orderResult.total_amount?.toLocaleString("id-ID")}
                </span>
              </p>
            </div>
            <div className="space-y-2">
              <Button
                className="w-full gradient-purple text-white"
                onClick={() => navigate("/customer")}
              >
                Lihat Detail Pesanan
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-rose-50/30">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/cart")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Pembayaran</h1>
              <p className="text-muted-foreground">
                Selesaikan pembayaran pesanan Anda
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Alamat Pengiriman</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Alamat Lengkap *</Label>
                      <Textarea
                        id="address"
                        placeholder="Masukkan alamat lengkap untuk pengiriman..."
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="min-h-[100px]"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Catatan (Opsional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Catatan tambahan untuk pesanan..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Metode Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-4"
                  >
                    {" "}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem
                        value="transfer_bank"
                        id="transfer_bank"
                      />
                      <Label
                        htmlFor="transfer_bank"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Transfer Bank</p>
                            <p className="text-sm text-muted-foreground">
                              Transfer langsung ke rekening bank
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "bank-transfer" && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Informasi Transfer Bank
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>
                          <strong>Bank:</strong> BCA
                        </p>
                        <p>
                          <strong>Nomor Rekening:</strong> 1234567890
                        </p>
                        <p>
                          <strong>Atas Nama:</strong> PT Viiona Pet Shop
                        </p>
                        <p className="text-xs mt-2">
                          *Setelah transfer, pembayaran akan otomatis
                          dikonfirmasi
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border-0 bg-card/50 backdrop-blur sticky top-6">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x @ Rp{" "}
                            {item.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Cost Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({cartSummary.total_items} item)</span>
                      <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ongkos Kirim</span>
                      <span>Rp {shipping.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
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

                  {/* Payment Button */}
                  <div className="space-y-3 pt-4">
                    <Button
                      className="w-full gradient-purple text-white"
                      size="lg"
                      onClick={handlePayment}
                      disabled={isProcessing || !shippingAddress.trim()}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Memproses Pembayaran...
                        </>
                      ) : (
                        `Bayar Sekarang - Rp ${total.toLocaleString("id-ID")}`
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/cart")}
                      disabled={isProcessing}
                    >
                      Kembali ke Keranjang
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

export default Payment;
