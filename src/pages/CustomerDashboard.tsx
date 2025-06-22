import { useState, useEffect } from "react";
import {
  User,
  Package,
  Calendar,
  CreditCard,
  Heart,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import userService, {
  DashboardStats,
  OrderHistory,
  UserProfile,
} from "@/services/userService";
import { isApiSuccess } from "@/utils/apiUtils";
import api from "@/services/api";

const CustomerDashboard = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    activeBookings: 0,
    wishlistItems: 0,
  });
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Wait for auth loading to complete first
      if (authLoading) return;

      if (!user?.id) {
        setLoading(false);
        setProfileLoaded(true);
        return;
      }

      try {
        const response = await userService.getProfile(user.id.toString());
        if (isApiSuccess(response) && response.data?.user) {
          setUserProfile(response.data.user);
        } else {
          // If profile fetch fails, use user data from AuthContext
          setUserProfile({
            id: user.id,
            full_name: user.full_name || user.email || "User",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "customer",
            created_at: user.created_at || new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Fallback to user data from AuthContext
        setUserProfile({
          id: user.id,
          full_name: user.full_name || user.email || "User",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "customer",
          created_at: user.created_at || new Date().toISOString(),
        });
      } finally {
        setProfileLoaded(true);
      }
    };

    fetchUserProfile();
  }, [user?.id, authLoading]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      setStatsLoading(true);
      try {
        const dashboardStats = await userService.getDashboardStats(
          user.id.toString()
        );
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await userService.getOrders({ limit: 10 });
        if (isApiSuccess(response) && response.data?.orders) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]);

  // Fetch appointments/bookings
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = (await api.get("/appointments", { limit: 10 })) as any;
        if (
          response &&
          response.data &&
          Array.isArray(response.data.appointments)
        ) {
          setAppointments(response.data.appointments);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        // Set empty array if appointments endpoint is not available
        setAppointments([]);
      }
    };

    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);

  // Set loading to false when profile is loaded
  useEffect(() => {
    if (!authLoading && profileLoaded) {
      setLoading(false);
    }
  }, [authLoading, profileLoaded]);

  // Add a timeout to ensure loading doesn't hang indefinitely
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Dashboard loading timeout - forcing load completion");
        setLoading(false);
        setProfileLoaded(true);

        // Set a fallback user profile if none exists and user is available
        if (!userProfile && user) {
          setUserProfile({
            id: user.id,
            full_name: user.full_name || user.email || "User",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "customer",
            created_at: user.created_at || new Date().toISOString(),
          });
        }
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loading, user, userProfile]);

  // Show loading if auth is still loading or if dashboard is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>
            {authLoading ? "Memuat autentikasi..." : "Memuat dashboard..."}
          </span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "shipped":
      case "dikirim":
        return "bg-blue-500";
      case "delivered":
      case "selesai":
        return "bg-emerald-500";
      case "scheduled":
      case "confirmed":
      case "terjadwal":
        return "bg-purple-500";
      case "processing":
      case "diproses":
        return "bg-rose-500";
      case "pending":
        return "bg-orange-500";
      default:
        return "bg-slate-500";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const displayName =
    userProfile?.full_name || user?.full_name || user?.email || "Pengguna";
  const memberSince = userProfile?.created_at || user?.created_at;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b2b82e38?w=100" />
              <AvatarFallback>
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                Selamat Datang, {displayName}!
              </h1>
              <p className="text-muted-foreground">
                Member sejak{" "}
                {memberSince ? formatDate(memberSince) : "Baru bergabung"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Pengaturan
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
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
                  <p className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      stats.totalOrders
                    )}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      appointments.length
                    )}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      stats.wishlistItems
                    )}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {user?.role === "admin" ? "Admin" : "Gold"}
                  </p>
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
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Belum ada pesanan</p>
                    <p className="text-sm text-muted-foreground">
                      Mulai berbelanja untuk melihat riwayat pesanan Anda
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-2 md:space-y-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold">
                            #{order.order_number}
                          </span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === "delivered"
                              ? "Dikirim"
                              : order.status === "shipped"
                              ? "Dalam Pengiriman"
                              : order.status === "processing"
                              ? "Diproses"
                              : order.status === "pending"
                              ? "Menunggu"
                              : order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {formatDate(order.created_at)}
                        </p>
                        <p className="text-sm">
                          {order.items && order.items.length > 0
                            ? order.items
                                .map((item) => item.product_name)
                                .join(", ")
                            : "Detail produk tidak tersedia"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {formatCurrency(Number(order.total_amount))}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Detail
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Jadwal Layanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Belum ada jadwal layanan
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pesan layanan untuk melihat jadwal Anda
                    </p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg space-y-2 md:space-y-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold">
                            {appointment.service_name}
                          </span>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status === "scheduled"
                              ? "Terjadwal"
                              : appointment.status === "confirmed"
                              ? "Dikonfirmasi"
                              : appointment.status === "completed"
                              ? "Selesai"
                              : appointment.status === "cancelled"
                              ? "Dibatalkan"
                              : appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {formatDate(appointment.appointment_date)} -{" "}
                          {appointment.appointment_time}
                        </p>
                        <p className="text-sm">
                          {appointment.pet_name
                            ? `${appointment.pet_name} (${
                                appointment.pet_type || "Pet"
                              })`
                            : "Detail hewan tidak tersedia"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm">
                          {appointment.status === "scheduled"
                            ? "Ubah"
                            : "Detail"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
                    <p className="text-muted-foreground">{displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-muted-foreground">
                      {userProfile?.email || user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telepon</label>
                    <p className="text-muted-foreground">
                      {userProfile?.phone || "Belum diisi"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <p className="text-muted-foreground">
                      {userProfile?.role || user?.role}
                    </p>
                  </div>
                  <Button className="gradient-purple text-white">
                    Edit Profil
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Hewan Peliharaan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Since we don't have pets table yet, show placeholder */}
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Belum ada data hewan peliharaan
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tambahkan hewan peliharaan Anda untuk kemudahan layanan
                    </p>
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
