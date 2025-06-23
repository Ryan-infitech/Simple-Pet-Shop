import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search, Filter, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import adminService, {
  AdminStats,
  CreateServiceData,
  CreateProductData,
} from "@/services/adminService";
import { isApiSuccess } from "@/utils/apiUtils";
import { Product, Service } from "@/types/api";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState<AdminStats>({
    totalServices: 0,
    totalProducts: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
  });
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form states
  const [serviceForm, setServiceForm] = useState<CreateServiceData>({
    name: "",
    description: "",
    price: 0,
    duration: "",
    category: "",
    is_available: true,
  });
  const [productForm, setProductForm] = useState<CreateProductData>({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    category_id: undefined,
    is_active: true,
    is_featured: false,
  });

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchServices(),
        fetchProducts(),
        fetchCategories(),
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      // Since we don't have admin stats endpoint yet, calculate from data
      const [servicesRes, productsRes] = await Promise.all([
        adminService.getServices({ limit: 1000 }),
        adminService.getProducts({ limit: 1000 }),
      ]);

      const statsData: AdminStats = {
        totalServices: isApiSuccess(servicesRes)
          ? servicesRes.data?.services?.length || 0
          : 0,
        totalProducts: isApiSuccess(productsRes)
          ? productsRes.data?.products?.length || 0
          : 0,
        totalBookings: 24, // Mock data for now
        monthlyRevenue: 2500000, // Mock data for now
      };

      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await adminService.getServices({ limit: 100 });
      if (isApiSuccess(response) && response.data?.services) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminService.getProducts({ limit: 100 });
      if (isApiSuccess(response) && response.data?.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCategories();
      if (isApiSuccess(response) && response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Service CRUD operations
  const handleCreateService = async () => {
    try {
      const response = await adminService.createService(serviceForm);
      if (isApiSuccess(response)) {
        toast({
          title: "Berhasil",
          description: "Layanan berhasil ditambahkan",
        });
        setIsServiceDialogOpen(false);
        resetServiceForm();
        await fetchServices();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error creating service:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan layanan",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      try {
        const response = await adminService.deleteService(id);
        if (isApiSuccess(response)) {
          toast({
            title: "Berhasil",
            description: "Layanan berhasil dihapus",
          });
          await fetchServices();
          await fetchStats();
        }
      } catch (error) {
        console.error("Error deleting service:", error);
        toast({
          title: "Error",
          description: "Gagal menghapus layanan",
          variant: "destructive",
        });
      }
    }
  };

  // Product CRUD operations
  const handleCreateProduct = async () => {
    try {
      const response = await adminService.createProduct(productForm);
      if (isApiSuccess(response)) {
        toast({
          title: "Berhasil",
          description: "Produk berhasil ditambahkan",
        });
        setIsProductDialogOpen(false);
        resetProductForm();
        await fetchProducts();
        await fetchStats();
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan produk",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        const response = await adminService.deleteProduct(id);
        if (isApiSuccess(response)) {
          toast({
            title: "Berhasil",
            description: "Produk berhasil dihapus",
          });
          await fetchProducts();
          await fetchStats();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Error",
          description: "Gagal menghapus produk",
          variant: "destructive",
        });
      }
    }
  };

  // Form helpers
  const resetServiceForm = () => {
    setServiceForm({
      name: "",
      description: "",
      price: 0,
      duration: "",
      category: "",
      is_available: true,
    });
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      category_id: undefined,
      is_active: true,
      is_featured: false,
    });
  };

  // Filter functions
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string | number) => {
    if (typeof status === "number") {
      // For is_available (services) or is_active (products)
      return status === 1 ? "bg-emerald-500" : "bg-rose-500";
    }

    switch (status?.toLowerCase()) {
      case "aktif":
      case "tersedia":
      case "active":
        return "bg-emerald-500";
      case "nonaktif":
      case "habis":
      case "inactive":
        return "bg-rose-500";
      case "terbatas":
        return "bg-purple-500";
      default:
        return "bg-slate-500";
    }
  };

  const getStatusText = (service: Service) => {
    return service.is_available === 1 ? "Aktif" : "Nonaktif";
  };

  const getProductStatus = (product: Product) => {
    if (!product.is_active) return "Nonaktif";
    if (product.stock_quantity === 0) return "Habis";
    if (product.stock_quantity <= 5) return "Terbatas";
    return "Tersedia";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-muted-foreground">
              Kelola layanan dan produk petshop
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Selamat datang kembali
            </p>
            <p className="font-semibold">Admin Viiona</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    stats.totalServices
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Layanan</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    stats.totalProducts
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Produk</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    stats.totalBookings
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Booking Hari Ini
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    `Rp ${(stats.monthlyRevenue / 1000000).toFixed(1)}M`
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Pendapatan Bulan Ini
                </p>
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
                    <Dialog
                      open={isServiceDialogOpen}
                      onOpenChange={setIsServiceDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="gradient-purple text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Layanan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Layanan Baru</DialogTitle>
                          <DialogDescription>
                            Isi formulir di bawah untuk menambahkan layanan
                            baru.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="service-name"
                              className="text-right"
                            >
                              Nama
                            </Label>
                            <Input
                              id="service-name"
                              className="col-span-3"
                              value={serviceForm.name}
                              onChange={(e) =>
                                setServiceForm({
                                  ...serviceForm,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="service-category"
                              className="text-right"
                            >
                              Kategori
                            </Label>
                            <Select
                              value={serviceForm.category}
                              onValueChange={(value) =>
                                setServiceForm({
                                  ...serviceForm,
                                  category: value,
                                })
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grooming">
                                  Grooming
                                </SelectItem>
                                <SelectItem value="kesehatan">
                                  Kesehatan
                                </SelectItem>
                                <SelectItem value="perawatan">
                                  Perawatan
                                </SelectItem>
                                <SelectItem value="hotel">Pet Hotel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="service-price"
                              className="text-right"
                            >
                              Harga
                            </Label>
                            <Input
                              id="service-price"
                              type="number"
                              className="col-span-3"
                              value={serviceForm.price}
                              onChange={(e) =>
                                setServiceForm({
                                  ...serviceForm,
                                  price: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="service-duration"
                              className="text-right"
                            >
                              Durasi
                            </Label>
                            <Input
                              id="service-duration"
                              className="col-span-3"
                              placeholder="e.g., 2-3 jam"
                              value={serviceForm.duration}
                              onChange={(e) =>
                                setServiceForm({
                                  ...serviceForm,
                                  duration: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="service-description"
                              className="text-right"
                            >
                              Deskripsi
                            </Label>
                            <Textarea
                              id="service-description"
                              className="col-span-3"
                              value={serviceForm.description}
                              onChange={(e) =>
                                setServiceForm({
                                  ...serviceForm,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            className="gradient-purple text-white"
                            onClick={handleCreateService}
                          >
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
                  {filteredServices.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Tidak ada layanan ditemukan
                      </p>
                    </div>
                  ) : (
                    filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-4 md:space-y-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{service.name}</h3>
                            <Badge
                              className={getStatusColor(service.is_available)}
                            >
                              {getStatusText(service)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <span>Kategori: {service.category || "Umum"}</span>
                            <span>
                              Harga: Rp{" "}
                              {Number(service.price).toLocaleString("id-ID")}
                            </span>
                            <span>Durasi: {service.duration}</span>
                            <span>
                              Rating: {Number(service.rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
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
                    <Dialog
                      open={isProductDialogOpen}
                      onOpenChange={setIsProductDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="gradient-purple text-white">
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
                            <Label
                              htmlFor="product-name"
                              className="text-right"
                            >
                              Nama
                            </Label>
                            <Input
                              id="product-name"
                              className="col-span-3"
                              value={productForm.name}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="product-category"
                              className="text-right"
                            >
                              Kategori
                            </Label>
                            <Select
                              value={productForm.category_id?.toString()}
                              onValueChange={(value) =>
                                setProductForm({
                                  ...productForm,
                                  category_id: Number(value),
                                })
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id.toString()}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="product-price"
                              className="text-right"
                            >
                              Harga
                            </Label>
                            <Input
                              id="product-price"
                              type="number"
                              className="col-span-3"
                              value={productForm.price}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  price: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="product-stock"
                              className="text-right"
                            >
                              Stok
                            </Label>
                            <Input
                              id="product-stock"
                              type="number"
                              className="col-span-3"
                              value={productForm.stock_quantity}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  stock_quantity: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="product-description"
                              className="text-right"
                            >
                              Deskripsi
                            </Label>
                            <Textarea
                              id="product-description"
                              className="col-span-3"
                              value={productForm.description}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            className="gradient-purple text-white"
                            onClick={handleCreateProduct}
                          >
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
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Tidak ada produk ditemukan
                      </p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-4 md:space-y-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{product.name}</h3>
                            <Badge
                              className={getStatusColor(
                                getProductStatus(product)
                              )}
                            >
                              {getProductStatus(product)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <span>
                              Kategori: {product.category_name || "Umum"}
                            </span>
                            <span>
                              Harga: Rp{" "}
                              {Number(product.price).toLocaleString("id-ID")}
                            </span>
                            <span>Stok: {product.stock_quantity}</span>
                            <span>
                              Rating: {Number(product.rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
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
