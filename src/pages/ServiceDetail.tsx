import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Star,
  ArrowLeft,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Service } from "@/types/api";
import serviceService from "@/services/serviceService";
import { isApiSuccess } from "@/utils/apiUtils";

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Generate some sample available dates (next 7 days)
  const availableDates = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split("T")[0];
  });

  // Sample time slots
  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const response = await serviceService.getServiceById(id);

        if (isApiSuccess(response) && response.data) {
          setService(response.data.service);
        } else {
          setError("Layanan tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching service:", err);
        setError("Gagal memuat layanan. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert("Silakan pilih tanggal dan waktu booking");
      return;
    }
    // Implement booking functionality here
    alert(
      `Layanan ${service?.name} telah dibooking untuk tanggal ${selectedDate} pukul ${selectedTime}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-6xl">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-6 bg-muted rounded w-1/4 mt-6"></div>
              <div className="h-10 bg-muted rounded w-full mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto text-center p-6">
          <CardContent className="space-y-4">
            <Info className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">
              {error || "Layanan tidak ditemukan"}
            </h1>
            <p className="text-muted-foreground">
              Layanan yang Anda cari tidak ditemukan atau terjadi kesalahan saat
              memuat data.
            </p>
            <Button onClick={() => navigate("/services")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Layanan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} jam${mins > 0 ? ` ${mins} menit` : ""}`;
    }
    return `${minutes} menit`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-rose-50/30">
      <div className="container py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
            onClick={() => navigate("/")}
          >
            Beranda
          </Button>
          <span className="mx-2">/</span>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
            onClick={() => navigate("/services")}
          >
            Layanan
          </Button>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">{service.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Service Image */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border overflow-hidden h-80 flex items-center justify-center">
              <img
                src={service.image_url || "/placeholder.svg"}
                alt={service.name}
                className="max-h-full max-w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="bg-primary/5 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Informasi Penting</h3>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Durasi Layanan</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(parseInt(service.duration || "60"))}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Lokasi</p>
                  <p className="text-sm text-muted-foreground">
                    Jl. Pet Love No. 123, Jakarta Selatan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {service.category_name || "Grooming"}
                </Badge>
                {service.is_featured && (
                  <Badge className="bg-orange-500">Unggulan</Badge>
                )}
                {service.is_available ? (
                  <Badge className="bg-green-500">Tersedia</Badge>
                ) : (
                  <Badge variant="destructive">Tidak Tersedia</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(service.avg_rating || 0)
                          ? "text-orange-500 fill-orange-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {service.avg_rating || "0"} ({service.review_count || "0"}{" "}
                  ulasan)
                </span>
              </div>
            </div>

            <div>
              <span className="text-3xl font-bold text-primary">
                Rp {parseFloat(service.price).toLocaleString("id-ID")}
              </span>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="font-semibold mb-2">Deskripsi Layanan</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* Booking Form */}
            {service.is_available && (
              <Card className="border-0 bg-card/50 backdrop-blur">
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-semibold text-lg">Booking Layanan</h2>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Pilih Tanggal
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableDates.map((date) => {
                        const d = new Date(date);
                        const formattedDate = d.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        });

                        return (
                          <Button
                            key={date}
                            variant={
                              selectedDate === date ? "default" : "outline"
                            }
                            className={`h-auto py-2 ${
                              selectedDate === date
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            <div className="text-center">
                              <div className="text-xs">
                                {d.toLocaleDateString("id-ID", {
                                  weekday: "short",
                                })}
                              </div>
                              <div>{formattedDate}</div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Pilih Waktu
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            className={
                              selectedTime === time
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full gradient-purple text-white mt-4"
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleBooking}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Booking Sekarang
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Service Details Tabs */}
        <Tabs defaultValue="details" className="mt-12">
          <TabsList className="w-full border-b rounded-none bg-transparent justify-start h-auto mb-6">
            <TabsTrigger
              value="details"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-10 px-4"
            >
              Detail Layanan
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-10 px-4"
            >
              Ulasan
            </TabsTrigger>
            <TabsTrigger
              value="faq"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-10 px-4"
            >
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Apa yang Termasuk</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Layanan oleh groomer/dokter profesional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Menggunakan produk berkualitas tinggi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Ruangan yang nyaman dan bersih</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Saran dan tips dari tenaga profesional</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Persyaratan</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <span>
                      Hewan dalam kondisi sehat (tidak sedang sakit berat)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <span>Bawa kartu vaksin untuk layanan tertentu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <span>Datang 10 menit sebelum jadwal yang ditentukan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <span>
                      Informasikan riwayat kesehatan atau alergi hewan
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="bg-primary/5 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">
                {service.avg_rating || "4.5"} / 5
              </h3>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(service.avg_rating || 4.5)
                        ? "text-orange-500 fill-orange-500"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mt-2">
                Berdasarkan {service.review_count || "8"} ulasan
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Ulasan Pelanggan</h3>

              {/* Sample Reviews */}
              <div className="space-y-6">
                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">DW</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Dewi W.</h4>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < 5
                                    ? "text-orange-500 fill-orange-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        5 hari yang lalu
                      </span>
                    </div>
                    <p className="text-sm">
                      Pelayanan sangat baik dan profesional. Kucing saya
                      terlihat senang dan bersih setelah grooming. Terima kasih!
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">BP</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Budi P.</h4>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < 4
                                    ? "text-orange-500 fill-orange-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        2 minggu yang lalu
                      </span>
                    </div>
                    <p className="text-sm">
                      Puas dengan pelayanan yang diberikan. Anjing saya terlihat
                      lebih segar dan wangi. Staf ramah dan informatif.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center pt-4">
                <Button variant="outline">Lihat Semua Ulasan</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  Berapa lama waktu yang diperlukan untuk layanan ini?
                </AccordionTrigger>
                <AccordionContent>
                  Layanan ini membutuhkan waktu sekitar{" "}
                  {formatDuration(parseInt(service.duration || "60"))}. Namun,
                  waktu bisa bervariasi tergantung pada kondisi dan kebutuhan
                  hewan peliharaan Anda.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Apakah perlu reservasi terlebih dahulu?
                </AccordionTrigger>
                <AccordionContent>
                  Ya, kami sangat menyarankan untuk melakukan reservasi terlebih
                  dahulu agar mendapatkan slot waktu yang diinginkan. Reservasi
                  dapat dilakukan melalui website atau menghubungi customer
                  service kami.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Dokumen apa yang perlu dibawa?
                </AccordionTrigger>
                <AccordionContent>
                  Untuk layanan kesehatan, sebaiknya membawa kartu vaksin atau
                  riwayat kesehatan hewan Anda. Untuk layanan grooming, tidak
                  ada dokumen khusus yang diperlukan.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  Apakah ada batasan usia hewan untuk layanan ini?
                </AccordionTrigger>
                <AccordionContent>
                  Layanan ini dapat dilakukan untuk hewan dengan usia minimal 3
                  bulan. Untuk hewan yang lebih muda atau memiliki kondisi
                  kesehatan khusus, kami menyarankan konsultasi terlebih dahulu
                  dengan dokter hewan kami.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  Bagaimana kebijakan pembatalan booking?
                </AccordionTrigger>
                <AccordionContent>
                  Pembatalan dapat dilakukan minimal 24 jam sebelum jadwal yang
                  telah ditentukan tanpa biaya. Pembatalan kurang dari 24 jam
                  akan dikenakan biaya 30% dari harga layanan.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        {/* Similar Services Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Layanan Lainnya</h2>
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">
              Layanan terkait akan ditampilkan di sini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
