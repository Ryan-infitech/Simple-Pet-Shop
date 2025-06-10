
import { useState } from "react";
import { CreditCard, Smartphone, Building2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const orderItems = [
    { name: "Royal Canin Cat Food", price: 285000, qty: 1 },
    { name: "Grooming Service", price: 150000, qty: 1 }
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-0 bg-card/50 backdrop-blur">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h2>
            <p className="text-muted-foreground mb-6">
              Terima kasih! Pesanan Anda telah berhasil diproses.
            </p>
            <div className="space-y-2 mb-6">
              <Button className="w-full gradient-pink text-primary-foreground">
                Lihat Detail Pesanan
              </Button>
              <Button variant="outline" className="w-full">
                Kembali ke Beranda
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
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <CreditCard className="h-5 w-5 text-primary" />
                      <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                        Kartu Kredit/Debit
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="e-wallet" id="e-wallet" />
                      <Smartphone className="h-5 w-5 text-primary" />
                      <Label htmlFor="e-wallet" className="flex-1 cursor-pointer">
                        E-Wallet (GoPay, OVO, DANA)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                      <Building2 className="h-5 w-5 text-primary" />
                      <Label htmlFor="bank-transfer" className="flex-1 cursor-pointer">
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
                      <Input id="card-number" placeholder="1234 5678 9012 3456" />
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
                      <Label htmlFor="cardholder-name">Nama Pemegang Kartu</Label>
                      <Input id="cardholder-name" placeholder="Nama sesuai kartu" />
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
                        <span className="text-2xl mb-1">💛</span>
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
                      <Button variant="outline" className="w-full justify-start h-12">
                        <span className="mr-3">🏦</span>
                        Bank BCA
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12">
                        <span className="mr-3">🏦</span>
                        Bank Mandiri
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12">
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
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                      </div>
                      <p className="font-medium">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PPN (10%)</span>
                      <span>Rp {tax.toLocaleString('id-ID')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full gradient-pink text-primary-foreground"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Memproses..." : "Bayar Sekarang"}
                  </Button>

                  <div className="text-center text-xs text-muted-foreground">
                    Dengan melakukan pembayaran, Anda menyetujui syarat dan ketentuan kami
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
