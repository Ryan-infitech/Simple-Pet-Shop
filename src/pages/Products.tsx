import { useEffect, useState } from "react";
import { Filter, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import ProductCard from "@/components/ProductCard";
import productService, { ProductQueryParams } from "@/services/productService";
import { useCategories } from "@/contexts/CategoryContext";
import { Product, Pagination } from "@/types/api";
import { handleApiError } from "@/utils/apiUtils";

const Products = () => {
  const { toast } = useToast();
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // We'll use products directly from the API since filtering is done on the server
  const filteredProducts = products;

  const sortOptions = [
    { value: "name", label: "Nama A-Z", apiValue: "name", apiOrder: "ASC" },
    {
      value: "price-low",
      label: "Harga Terendah",
      apiValue: "price",
      apiOrder: "ASC",
    },
    {
      value: "price-high",
      label: "Harga Tertinggi",
      apiValue: "price",
      apiOrder: "DESC",
    },
    {
      value: "rating",
      label: "Rating Tertinggi",
      apiValue: "rating",
      apiOrder: "DESC",
    },
  ];

  const getSortParams = (sortValue: string) => {
    const option = sortOptions.find((opt) => opt.value === sortValue);
    return option
      ? {
          sort_by: option.apiValue,
          sort_order: option.apiOrder as "ASC" | "DESC",
        }
      : {};
  };

  const fetchProducts = async (
    params: ProductQueryParams = {},
    isLoadMore = false
  ) => {
    setIsLoading(true);
    try {
      const queryParams: ProductQueryParams = {
        ...params,
        page: params.page || pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: params.search !== undefined ? params.search : searchTerm,
        ...getSortParams(sortBy),
      };

      // Gunakan category dari params jika ada, atau dari selectedCategory
      const categoryToUse =
        params.category !== undefined ? params.category : selectedCategory;
      if (categoryToUse !== "all" && categoryToUse !== undefined) {
        queryParams.category = categoryToUse;
      }

      console.log("Fetching products with params:", queryParams);
      const response = await productService.getProducts(queryParams);

      if (response.success && response.data) {
        // Transform products untuk kompatibilitas
        const transformedProducts = response.data.products.map((product) => ({
          ...product,
          stock: product.stock_quantity || 0,
          images: product.image_url ? [product.image_url] : [],
        }));

        // Jika ini adalah load more, tambahkan ke produk yang sudah ada
        // Jika tidak, ganti semua produk
        if (isLoadMore) {
          setProducts((prevProducts) => [
            ...prevProducts,
            ...transformedProducts,
          ]);
        } else {
          setProducts(transformedProducts);
        }

        // Transform pagination untuk kompatibilitas
        const backendPagination = response.data.pagination;

        // Only update pagination if this is NOT a load more request
        // For load more, we've already updated the currentPage manually
        if (!isLoadMore) {
          setPagination({
            currentPage: backendPagination.page || pagination.currentPage,
            totalPages: backendPagination.pages || 1,
            totalItems: backendPagination.total || 0,
            itemsPerPage: backendPagination.limit || pagination.itemsPerPage,
          });
        } else {
          // For load more, only update the metadata, keep the currentPage as is
          setPagination((prev) => ({
            ...prev,
            totalPages: backendPagination.pages || prev.totalPages,
            totalItems: backendPagination.total || prev.totalItems,
            itemsPerPage: backendPagination.limit || prev.itemsPerPage,
          }));
        }
      } else {
        console.error("API response error:", response);
        handleApiError(null, response.message || "Gagal memuat produk");
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      handleApiError(error, "Gagal memuat produk. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    setPagination({ ...pagination, currentPage: 1 });
    fetchProducts();
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPagination({ ...pagination, currentPage: 1 });
    fetchProducts(
      { category: value === "all" ? undefined : value, page: 1 },
      false
    );
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPagination({ ...pagination, currentPage: 1 });
    fetchProducts({ ...getSortParams(value), page: 1 }, false);
  };

  const handleLoadMore = () => {
    if (pagination.currentPage < pagination.totalPages) {
      const nextPage = pagination.currentPage + 1;

      // Update pagination state immediately to prevent duplicate requests
      setPagination((prev) => ({ ...prev, currentPage: nextPage }));

      // Kirim semua parameter yang sama seperti query saat ini
      const loadMoreParams: ProductQueryParams = {
        page: nextPage,
        search: searchTerm,
        ...getSortParams(sortBy),
      };

      if (selectedCategory !== "all") {
        loadMoreParams.category = selectedCategory;
      }

      console.log("Load More - Page:", nextPage);

      fetchProducts(loadMoreParams, true); // Pass true untuk isLoadMore
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("name");
    setPagination({ ...pagination, currentPage: 1 });
    fetchProducts({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-rose-50/30">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Produk Kami</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Temukan produk terbaik untuk hewan peliharaan kesayangan Anda
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-card/50 rounded-lg backdrop-blur border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Menampilkan {filteredProducts.length} dari {pagination.totalItems}{" "}
            produk
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.images[0]}
              category={product.category_name}
              rating={Number(product.rating) || 0}
              inStock={product.stock > 0}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold mb-2">
              Produk tidak ditemukan
            </p>
            <p className="text-muted-foreground mb-6">
              Coba ubah kata kunci pencarian atau filter Anda
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
            >
              Reset Pencarian
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredProducts.length > 0 &&
          pagination.currentPage < pagination.totalPages && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" onClick={handleLoadMore}>
                Muat Lebih Banyak
              </Button>
            </div>
          )}
      </div>
    </div>
  );
};

export default Products;
