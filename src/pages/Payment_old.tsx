import { useState, useEffect } from "react";
import { CreditCard, Smartphone, Building2, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
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
      // Create order from cart
      const orderResponse = await orderService.createOrderFromCart({
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        notes: notes,
      });

      if (orderResponse.success && orderResponse.data) {
        const orderId = orderResponse.data.order_id;
        
        // Process payment (auto-success for bank transfer)
        const paymentResponse = await orderService.quickPayment({
          order_id: orderId,
          payment_method: paymentMethod,
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
        description: error.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran",
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
              <p>Nomor Pesanan: <span className="font-mono">{orderResult.order_number}</span></p>
              <p>Referensi Pembayaran: <span className="font-mono">{orderResult.payment?.reference_number}</span></p>
              <p>Total: <span className="font-semibold">Rp {orderResult.total_amount?.toLocaleString("id-ID")}</span></p>
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
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Pembayaran</h1>
            <p className="text-muted-foreground">Selesaikan pesanan Anda</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method */}
              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Metode Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <CreditCard className="h-5 w-5 text-primary" />
                      <Label
                        htmlFor="credit-card"
                        className="flex-1 cursor-pointer"
                      >
                        Kartu Kredit/Debit
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="e-wallet" id="e-wallet" />
                      <Smartphone className="h-5 w-5 text-primary" />
                      <Label
                        htmlFor="e-wallet"
                        className="flex-1 cursor-pointer"
                      >
                        E-Wallet (GoPay, OVO, DANA)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem
                        value="transfer_bank"
                        id="transfer_bank"
                      />
                      <Building2 className="h-5 w-5 text-primary" />
                      <Label
                        htmlFor="transfer_bank"
                        className="flex-1 cursor-pointer"
                      >
                        Transfer Bank
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Details */}
              {paymentMethod === "credit-card" && (
                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Detail Kartu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Nomor Kartu</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Berlaku Hingga</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardholder-name">
                        Nama Pemegang Kartu
                      </Label>
                      <Input
                        id="cardholder-name"
                        placeholder="Nama sesuai kartu"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {paymentMethod === "e-wallet" && (
                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Pilih E-Wallet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <Button variant="outline" className="h-20 flex flex-col">
                        <span className="text-2xl mb-1">💚</span>
                        <span className="text-sm">GoPay</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col">
                        <span className="text-2xl mb-1">💙</span>
                        <span className="text-sm">OVO</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col">
                        <span className="text-2xl mb-1">🧡</span>
                        <span className="text-sm">DANA</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {paymentMethod === "bank-transfer" && (
                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Pilih Bank</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start h-12"
                      >
                        <span className="mr-3">🏦</span>
                        Bank BCA
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-12"
                      >
                        <span className="mr-3">🏦</span>
                        Bank Mandiri
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-12"
                      >
                        <span className="mr-3">🏦</span>
                        Bank BNI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Billing Address */}
              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Alamat Penagihan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Nama Depan</Label>
                      <Input id="first-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Nama Belakang</Label>
                      <Input id="last-name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Input id="address" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Kota</Label>
                      <Input id="city" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Provinsi</Label>
                      <Input id="state" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">Kode Pos</Label>
                      <Input id="zip" />
                    </div>
                  </div>
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
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.qty}
                        </p>
                      </div>
                      <p className="font-medium">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PPN (10%)</span>
                      <span>Rp {tax.toLocaleString("id-ID")}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        Rp {total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full gradient-purple text-white"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Memproses..." : "Bayar Sekarang"}
                  </Button>

                  <div className="text-center text-xs text-muted-foreground">
                    Dengan melakukan pembayaran, Anda menyetujui syarat dan
                    ketentuan kami
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
