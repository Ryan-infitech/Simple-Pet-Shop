
import { User, Package, Calendar, CreditCard, Heart, Settings, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CustomerDashboard = () => {
  const orders = [
    {
      id: "ORD-001",
      date: "2024-06-08",
      items: ["Royal Canin Cat Food", "Vitamin Kucing"],
      total: 430000,
      status: "Dikirim"
    },
    {
      id: "ORD-002", 
      date: "2024-06-05",
      items: ["Grooming Service"],
      total: 150000,
      status: "Selesai"
    }
  ];

  const bookings = [
    {
      id: "BK-001",
      service: "Vaksinasi",
      date: "2024-06-15",
      time: "10:00",
      pet: "Fluffy (Kucing)",
      status: "Terjadwal"
    },
    {
      id: "BK-002",
      service: "Grooming",
      date: "2024-06-12",
      time: "14:00", 
      pet: "Buddy (Anjing)",
      status: "Selesai"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dikirim": return "bg-blue-500";
      case "Selesai": return "bg-green-500";
      case "Terjadwal": return "bg-yellow-500";
      case "Diproses": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b2b82e38?w=100" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Selamat Datang, Sarah!</h1>
              <p className="text-muted-foreground">Member sejak Januari 2024</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Pengaturan
            </Button>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Total Pesanan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Jadwal Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Favorit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">Gold</p>
                  <p className="text-sm text-muted-foreground">Status Member</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Riwayat Pesanan</TabsTrigger>
            <TabsTrigger value="bookings">Jadwal Layanan</TabsTrigger>
            <TabsTrigger value="profile">Profil & Hewan</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Riwayat Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-2 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{order.id}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {new Date(order.date).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-sm">{order.items.join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        Rp {order.total.toLocaleString('id-ID')}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Detail
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Jadwal Layanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-2 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{booking.service}</span>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {new Date(booking.date).toLocaleDateString('id-ID')} - {booking.time}
                      </p>
                      <p className="text-sm">{booking.pet}</p>
                    </div>
                    <div className="text-right">
                      <Button variant="outline" size="sm">
                        {booking.status === "Terjadwal" ? "Ubah" : "Detail"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Informasi Profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nama Lengkap</label>
                    <p className="text-muted-foreground">Sarah Amelinda</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-muted-foreground">sarah@email.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telepon</label>
                    <p className="text-muted-foreground">+62 812-3456-7890</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alamat</label>
                    <p className="text-muted-foreground">Jl. Mawar No. 15, Jakarta Selatan</p>
                  </div>
                  <Button className="gradient-pink text-primary-foreground">
                    Edit Profil
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Hewan Peliharaan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        🐱
                      </div>
                      <div>
                        <p className="font-semibold">Fluffy</p>
                        <p className="text-sm text-muted-foreground">Kucing Persian, 3 tahun</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        🐶
                      </div>
                      <div>
                        <p className="font-semibold">Buddy</p>
                        <p className="text-sm text-muted-foreground">Golden Retriever, 5 tahun</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    + Tambah Hewan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
