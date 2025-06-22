import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Star,
  Truck,
  Info,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types/api";
import productService from "@/services/productService";
import { isApiSuccess } from "@/utils/apiUtils";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const response = await productService.getProductById(id);
        if (isApiSuccess(response) && response.data) {
          // Transform the product data for compatibility
          // The API returns the product nested under response.data.product
          const productData = response.data.product || response.data;
          const transformedProduct = {
            ...productData,
            // Ensure proper data types
            price:
              typeof productData.price === "string"
                ? productData.price
                : String(productData.price),
            stock_quantity: Number(productData.stock_quantity) || 0,
            rating:
              typeof productData.rating === "string"
                ? productData.rating
                : String(productData.rating),
            avg_rating: Number(productData.avg_rating) || 0,
            review_count: Number(productData.review_count) || 0,
          };

          setProduct(transformedProduct);
          // Set active image from the API response
          setActiveImage(productData.image_url || "/placeholder.svg");
        } else {
          setError("Produk tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Gagal memuat produk. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) =>
        prev < (Number(product?.stock_quantity) || 10) ? prev + 1 : prev
      );
    } else {
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    }
  };
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    if (!product || !product.id) return;

    const success = await addToCart(Number(product.id), quantity);

    if (success) {
      toast({
        title: "Berhasil",
        description: `Produk ${product.name} (${quantity} pcs) telah ditambahkan ke keranjang`,
      });
    } else {
      toast({
        title: "Gagal",
        description: "Gagal menambahkan produk ke keranjang",
        variant: "destructive",
      });
    }
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    // Implement wishlist functionality here
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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto text-center p-6">
          <CardContent className="space-y-4">
            <Info className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">
              {error || "Produk tidak ditemukan"}
            </h1>
            <p className="text-muted-foreground">
              Produk yang Anda cari tidak ditemukan atau terjadi kesalahan saat
              memuat data.
            </p>
            <Button onClick={() => navigate("/products")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Katalog Produk
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            onClick={() => navigate("/products")}
          >
            Produk
          </Button>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border overflow-hidden h-96 flex items-center justify-center">
              <img
                src={activeImage || "/placeholder.svg"}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {product.category_name}
                </Badge>
                {product.is_featured && (
                  <Badge className="bg-orange-500">Unggulan</Badge>
                )}
                {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-300"
                  >
                    Stok Terbatas
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>{" "}
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(Number(product.rating) || 0)
                          ? "text-orange-500 fill-orange-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {Number(product.rating) || "0"} ({product.review_count || "0"}{" "}
                  ulasan)
                </span>
              </div>
            </div>{" "}
            <div>
              <span className="text-3xl font-bold text-primary">
                Rp {Number(product.price).toLocaleString("id-ID")}
              </span>
              {product.stock_quantity === 0 ? (
                <div className="mt-2">
                  <Badge variant="destructive">Stok Habis</Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Tersedia: {product.stock_quantity} pcs
                </p>
              )}
            </div>
            <Separator />
            {/* Description */}
            <div>
              <h2 className="font-semibold mb-2">Deskripsi Produk</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>{" "}
            {/* Add to Cart */}
            {Number(product.stock_quantity) > 0 && (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange("decrease")}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange("increase")}
                      disabled={quantity >= Number(product.stock_quantity)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Button
                      className="w-full gradient-purple text-white"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Tambah ke Keranjang
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className={`${
                    isInWishlist
                      ? "border-pink-200 bg-pink-50 text-pink-500"
                      : ""
                  }`}
                  onClick={handleToggleWishlist}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      isInWishlist ? "fill-pink-500" : ""
                    }`}
                  />
                  {isInWishlist ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
                </Button>
              </div>
            )}
            {/* Shipping Info */}
            <div className="bg-primary/5 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-start space-x-2">
                <Truck className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <span className="font-medium">Pengiriman Cepat</span>
                  <p className="text-muted-foreground">
                    Pesanan dikirim dalam 1-3 hari kerja
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="h-4 w-4 mt-0.5 text-green-500" />
                <div>
                  <span className="font-medium">Garansi Kualitas</span>
                  <p className="text-muted-foreground">
                    Semua produk telah melalui proses quality control
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="mt-12">
          <TabsList className="w-full border-b rounded-none bg-transparent justify-start h-auto mb-6">
            <TabsTrigger
              value="details"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-10 px-4"
            >
              Detail Produk
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-10 px-4"
            >
              Ulasan
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-10 px-4"
            >
              Pengiriman & Pengembalian
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Spesifikasi</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Kategori</span>
                    <span className="font-medium">{product.category_name}</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Berat</span>
                    <span className="font-medium">500 gram</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Ukuran</span>
                    <span className="font-medium">Standar</span>
                  </li>
                  <li className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Untuk Hewan</span>
                    <span className="font-medium">Kucing, Anjing</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Informasi Tambahan</h3>
                <p className="text-muted-foreground">
                  Produk ini ideal untuk hewan peliharaan segala usia.
                  Mengandung bahan berkualitas tinggi untuk menjaga kesehatan
                  dan kebahagiaan hewan kesayangan Anda.
                </p>
                <p className="text-muted-foreground mt-2">
                  Simpan di tempat kering dan hindari paparan sinar matahari
                  langsung.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="bg-primary/5 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">4.5 / 5</h3>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < 4
                        ? "text-orange-500 fill-orange-500"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mt-2">
                Berdasarkan 12 ulasan
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Ulasan Pembeli</h3>

              {/* Sample Reviews */}
              <div className="space-y-6">
                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">AR</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Ahmad R.</h4>
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
                        2 hari yang lalu
                      </span>
                    </div>
                    <p className="text-sm">
                      Produk sangat bagus dan berkualitas. Kucing saya suka
                      sekali, akan beli lagi.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">SM</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Sinta M.</h4>
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
                        1 minggu yang lalu
                      </span>
                    </div>
                    <p className="text-sm">
                      Kualitas bagus, pengiriman cepat. Hewan saya suka dengan
                      produk ini.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center pt-4">
                <Button variant="outline">Lihat Semua Ulasan</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Informasi Pengiriman</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <Truck className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <span className="font-medium">Pengiriman Reguler</span>
                      <p className="text-sm text-muted-foreground">
                        Estimasi 2-3 hari kerja. Biaya pengiriman dihitung
                        berdasarkan lokasi pengiriman.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <span className="font-medium">Pengiriman Express</span>
                      <p className="text-sm text-muted-foreground">
                        Estimasi 1 hari kerja. Tersedia untuk area tertentu
                        dengan biaya tambahan.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Kebijakan Pengembalian</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <span className="font-medium">Pengembalian 7 Hari</span>
                      <p className="text-sm text-muted-foreground">
                        Produk dapat dikembalikan dalam waktu 7 hari setelah
                        diterima jika masih dalam kondisi asli.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <span className="font-medium">
                        Produk Rusak atau Cacat
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Produk yang rusak atau cacat dapat ditukar dengan produk
                        yang sama atau pengembalian dana penuh.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Produk Terkait</h2>
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">
              Produk terkait akan ditampilkan di sini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
