
import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const services = [
    {
      id: "1",
      name: "Full Grooming Package",
      category: "Grooming",
      price: 150000,
      duration: "2-3 jam",
      status: "Aktif",
      bookings: 12
    },
    {
      id: "2",
      name: "Vaksinasi Lengkap", 
      category: "Kesehatan",
      price: 250000,
      duration: "30 menit",
      status: "Aktif",
      bookings: 8
    },
    {
      id: "3",
      name: "Pet Spa Treatment",
      category: "Grooming", 
      price: 200000,
      duration: "1-2 jam",
      status: "Nonaktif",
      bookings: 0
    }
  ];

  const products = [
    {
      id: "1",
      name: "Royal Canin Adult Cat Food",
      category: "Makanan",
      price: 285000,
      stock: 25,
      status: "Tersedia"
    },
    {
      id: "2",
      name: "Vitamin Kucing Premium", 
      category: "Vitamin",
      price: 145000,
      stock: 0,
      status: "Habis"
    },
    {
      id: "3",
      name: "Dog Shampoo Anti-Flea",
      category: "Perawatan",
      price: 85000,
      stock: 15,
      status: "Tersedia"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif":
      case "Tersedia": return "bg-green-500";
      case "Nonaktif":
      case "Habis": return "bg-red-500";
      case "Terbatas": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-muted-foreground">Kelola layanan dan produk petshop</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Selamat datang kembali</p>
            <p className="font-semibold">Admin Viiona</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">156</p>
                <p className="text-sm text-muted-foreground">Total Layanan</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">89</p>
                <p className="text-sm text-muted-foreground">Produk Aktif</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">24</p>
                <p className="text-sm text-muted-foreground">Booking Hari Ini</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">Rp 2.5M</p>
                <p className="text-sm text-muted-foreground">Pendapatan Bulan Ini</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Kelola Layanan</TabsTrigger>
            <TabsTrigger value="products">Kelola Produk</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>Manajemen Layanan</CardTitle>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari layanan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 md:w-64"
                      />
                    </div>
                    <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gradient-pink text-primary-foreground">
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Layanan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Layanan Baru</DialogTitle>
                          <DialogDescription>
                            Isi formulir di bawah untuk menambahkan layanan baru.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="service-name" className="text-right">
                              Nama
                            </Label>
                            <Input id="service-name" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="service-category" className="text-right">
                              Kategori
                            </Label>
                            <Select>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grooming">Grooming</SelectItem>
                                <SelectItem value="kesehatan">Kesehatan</SelectItem>
                                <SelectItem value="perawatan">Perawatan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="service-price" className="text-right">
                              Harga
                            </Label>
                            <Input id="service-price" type="number" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="service-duration" className="text-right">
                              Durasi
                            </Label>
                            <Input id="service-duration" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="service-description" className="text-right">
                              Deskripsi
                            </Label>
                            <Textarea id="service-description" className="col-span-3" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="gradient-pink text-primary-foreground">
                            Simpan Layanan
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{service.name}</h3>
                          <Badge className={getStatusColor(service.status)}>
                            {service.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <span>Kategori: {service.category}</span>
                          <span>Harga: Rp {service.price.toLocaleString('id-ID')}</span>
                          <span>Durasi: {service.duration}</span>
                          <span>Booking: {service.bookings}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>Manajemen Produk</CardTitle>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 md:w-64"
                      />
                    </div>
                    <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gradient-pink text-primary-foreground">
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Produk
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Produk Baru</DialogTitle>
                          <DialogDescription>
                            Isi formulir di bawah untuk menambahkan produk baru.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product-name" className="text-right">
                              Nama
                            </Label>
                            <Input id="product-name" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product-category" className="text-right">
                              Kategori
                            </Label>
                            <Select>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="makanan">Makanan</SelectItem>
                                <SelectItem value="vitamin">Vitamin</SelectItem>
                                <SelectItem value="perawatan">Perawatan</SelectItem>
                                <SelectItem value="mainan">Mainan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product-price" className="text-right">
                              Harga
                            </Label>
                            <Input id="product-price" type="number" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product-stock" className="text-right">
                              Stok
                            </Label>
                            <Input id="product-stock" type="number" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product-description" className="text-right">
                              Deskripsi
                            </Label>
                            <Textarea id="product-description" className="col-span-3" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="gradient-pink text-primary-foreground">
                            Simpan Produk
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          <Badge className={getStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <span>Kategori: {product.category}</span>
                          <span>Harga: Rp {product.price.toLocaleString('id-ID')}</span>
                          <span>Stok: {product.stock}</span>
                          <span>Status: {product.status}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
