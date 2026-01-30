// pages/products/view/[id].tsx - View Product Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  Tag,
  DollarSign,
  Percent,
  Hash,
  ArrowLeft,
  Info,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Star,
  Truck,
  Gift,
  Shield,
  Image as ImageIcon,
  Palette,
  Ruler,
  Users,
  Calendar,
  BarChart3,
  Layers,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { GetSpecifiedMethod } from "../../services/apis/ApiMethod";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

// Product Interfaces based on your data structure
interface Name {
  ar: string;
  en: string;
}

interface Description {
  ar: string;
  en: string;
}

interface Brand {
  id: number;
  title: Name;
  image: string;
  description: Description;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

interface Category {
  id: number;
  title: Name;
  parentId: number | null;
  image: string;
  active: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

interface ProductImage {
  id: number;
  productId: number;
  variantId: number | null;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Attribute {
  id: number;
  key: string;
  name: string;
  sourcePath: string;
  isActive: boolean;
}

interface Option {
  id: number;
  attributeId: number;
  value: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface VariantAttribute {
  id: number;
  variantId: number;
  attributeId: number;
  optionId: number;
  attribute: Attribute;
  option: Option;
}

interface Variant {
  id: number;
  productId: number;
  displayOrder: number;
  price: number;
  offerPrice: number | null;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  images: ProductImage[];
  attributes: VariantAttribute[];
}

interface FilterValue {
  id: number;
  productId: number;
  attributeId: number;
  optionId: number;
  attribute: Attribute;
  option: Option;
}

interface Product {
  id: number;
  name: Name;
  description: Description;
  features: string;
  brandId: number;
  categoryId: number;
  storeId: number | null;
  basePrice: string;
  offerPrice: string | null;
  isFreeDelivery: boolean;
  isFastShipping: boolean;
  ableToGift: boolean;
  isActive: boolean;
  stockQuantity: number;
  sku: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  brand: Brand;
  category: Category;
  store: any | null;
  images: ProductImage[];
  variants: Variant[];
  filterValues: FilterValue[];
}

interface ProductResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: Product;
}

// Fetch product by ID
const fetchProductById = async (id: string, lang: string): Promise<Product> => {
  try {
    const response = (await GetSpecifiedMethod(
      `/products/${id}`,
      lang,
    )) as ProductResponse;

    if (!response || !response.data) {
      throw new Error("Product not found");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

const formatImageUrl = (url: string) => {
  return import.meta.env.VITE_IMAGE_BASE_URL + url;
};

export default function ViewProductPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const productId = params.id as string;
  const lang = i18n.language || "en";
  const [copied, setCopied] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Fetch product data
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId, lang],
    queryFn: () => fetchProductById(productId, lang),
    enabled: !!productId,
  });

  // Set first variant as selected when product loads
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success(t("products.view.messages.copied"));
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      lang === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  // Format currency
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  // Calculate discount percentage
  const calculateDiscount = (basePrice: string, offerPrice: string | null) => {
    if (!offerPrice) return 0;
    const base = parseFloat(basePrice);
    const offer = parseFloat(offerPrice);
    return Math.round(((base - offer) / base) * 100);
  };

  // Get active variants
  const getActiveVariants = () => {
    return product?.variants.filter((v) => v.isActive) || [];
  };

  // Get grouped attributes from filter values
  const getGroupedAttributes = () => {
    if (!product) return {};
    const grouped: Record<string, Option[]> = {};

    product.filterValues.forEach((fv) => {
      if (!grouped[fv.attribute.key]) {
        grouped[fv.attribute.key] = [];
      }
      // Check if option already exists to avoid duplicates
      if (!grouped[fv.attribute.key].some((opt) => opt.id === fv.option.id)) {
        grouped[fv.attribute.key] = [...grouped[fv.attribute.key], fv.option];
      }
    });

    return grouped;
  };

  // Get variant attributes display
  const getVariantAttributesDisplay = (variant: Variant) => {
    return variant.attributes
      .map((attr) => `${attr.attribute.name}: ${attr.option.name}`)
      .join(" • ");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-amber-950/30 dark:to-emerald-950/30 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {t("products.view.back")}
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-600 to-orange-600" />
            <div className="p-8">
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {t("products.view.loading")}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t("products.view.loadingMessage")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-amber-950/30 dark:to-emerald-950/30 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {t("products.view.back")}
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-600 to-orange-600" />
            <div className="p-8">
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    <XCircle size={40} className="text-red-600" />
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                    {t("products.view.error")}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                    {t("products.view.errorMessage")}
                  </p>
                  <button
                    onClick={() => navigate("/products")}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    {t("products.view.retry")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount(product.basePrice, product.offerPrice);
  const activeVariants = getActiveVariants();
  const groupedAttributes = getGroupedAttributes();
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];
  const totalStock = product.variants.reduce(
    (sum, variant) => sum + variant.stockQuantity,
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-amber-950/30 dark:to-emerald-950/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("products.view.back")}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl">
              <Package size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-slate-100 dark:via-amber-100 dark:to-orange-100 bg-clip-text text-transparent">
                {product.name[lang === "ar" ? "ar" : "en"]}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">
                  {product.sku}
                </span>
                <span>•</span>
                <span>{t("products.view.description")}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/products/edit/${productId}`)}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t("products.view.buttons.edit")}
              </button>
              <button
                onClick={() => navigate("/products")}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t("products.view.buttons.backToList")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Images and Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
                    <ImageIcon
                      size={20}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("products.view.images.title")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("products.view.images.description", {
                        count: product.images.length,
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* Main Image */}
                <div className="mb-6">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700">
                    {product.images.length > 0 ? (
                      <img
                        src={formatImageUrl(
                          product.images[selectedImageIndex].imageUrl,
                        )}
                        alt={
                          product.images[selectedImageIndex].altText ||
                          product.name[lang === "ar" ? "ar" : "en"]
                        }
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={64} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          selectedImageIndex === index
                            ? "border-amber-500 ring-2 ring-amber-500/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <img
                          src={formatImageUrl(image.imageUrl)}
                          alt={
                            image.altText ||
                            `${product.name[lang === "ar" ? "ar" : "en"]} - ${index + 1}`
                          }
                          className="w-full h-full object-cover"
                        />
                        {image.isPrimary && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <Star size={10} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Information Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-600 to-orange-600" />
              <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
                    <Info
                      size={20}
                      className="text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("products.view.productInfo.title")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("products.view.productInfo.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t("products.view.fields.name")}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t("products.view.fields.englishName")}
                        </div>
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300">
                          {product.name.en || "N/A"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t("products.view.fields.arabicName")}
                        </div>
                        <div
                          className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
                          dir="rtl"
                        >
                          {product.name.ar || "غير متوفر"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t("products.view.fields.description")}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t("products.view.fields.englishDescription")}
                        </div>
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 min-h-[100px]">
                          {product.description.en || "N/A"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t("products.view.fields.arabicDescription")}
                        </div>
                        <div
                          className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 min-h-[100px]"
                          dir="rtl"
                        >
                          {product.description.ar || "غير متوفر"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t("products.view.fields.features")}
                    </label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300">
                      {product.features || "N/A"}
                    </div>
                  </div>

                  {/* Brand and Category */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t("products.view.fields.brand")}
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl flex items-center gap-3">
                      {product.brand?.image && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <img
                            src={formatImageUrl(product.brand.image)}
                            alt={
                              product.brand.title[lang === "ar" ? "ar" : "en"]
                            }
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {product.brand?.title?.[
                            lang === "ar" ? "ar" : "en"
                          ] || "N/A"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ID: {product.brandId}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t("products.view.fields.category")}
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center gap-3">
                      {product.category?.image && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <img
                            src={formatImageUrl(product.category.image)}
                            alt={
                              product.category.title[
                                lang === "ar" ? "ar" : "en"
                              ]
                            }
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {product.category?.title?.[
                            lang === "ar" ? "ar" : "en"
                          ] || "N/A"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ID: {product.categoryId} • Type:{" "}
                          {product.category?.type}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variants Card */}
            {product.variants.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-purple-600 to-pink-600" />
                <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
                      <Layers
                        size={20}
                        className="text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {t("products.view.variants.title")}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t("products.view.variants.description", {
                          count: product.variants.length,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {product.variants
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((variant) => (
                        <div
                          key={variant.id}
                          className={`p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                            selectedVariant?.id === variant.id
                              ? "border-amber-500 ring-2 ring-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10"
                              : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                          onClick={() => setSelectedVariant(variant)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-500/20 dark:to-pink-500/20 rounded-lg">
                                <Tag
                                  size={16}
                                  className="text-purple-600 dark:text-purple-400"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900 dark:text-white">
                                  {t("products.view.variants.variant")} #
                                  {variant.displayOrder}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  ID: {variant.id}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                variant.isActive
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                              }`}
                            >
                              {variant.isActive
                                ? t("common.active")
                                : t("common.inactive")}
                            </div>
                          </div>

                          {/* Variant Attributes */}
                          <div className="mb-3">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                              {t("products.view.variants.attributes")}
                            </div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                              {getVariantAttributesDisplay(variant)}
                            </div>
                          </div>

                          {/* Price and Stock */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                {t("products.view.fields.price")}
                              </div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                ${variant.price.toFixed(2)}
                              </div>
                              {variant.offerPrice && (
                                <div className="text-xs text-green-600 dark:text-green-400">
                                  Offer: ${variant.offerPrice.toFixed(2)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                {t("products.view.fields.stock")}
                              </div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {variant.stockQuantity}
                              </div>
                              <div
                                className={`text-xs ${
                                  variant.stockQuantity <= 20
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                {variant.stockQuantity <= 20
                                  ? t("products.lowStock")
                                  : t("products.inStock")}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Filter Attributes Card */}
            {product.filterValues.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-600 to-teal-600" />
                <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-lg">
                      <Tag
                        size={20}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {t("products.view.attributes.title")}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t("products.view.attributes.description", {
                          count: product.filterValues.length,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(groupedAttributes).map(
                      ([attributeKey, options]) => (
                        <div
                          key={attributeKey}
                          className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50"
                        >
                          <div className="font-medium text-slate-900 dark:text-white mb-2">
                            {attributeKey.charAt(0).toUpperCase() +
                              attributeKey.slice(1)}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {options.map((option) => (
                              <span
                                key={option.id}
                                className="px-3 py-1 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                              >
                                {option.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Pricing, Status, and Statistics */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-600 to-emerald-600" />
              <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 rounded-lg">
                    <DollarSign
                      size={20}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("products.view.pricing.title")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("products.view.pricing.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Base Price */}
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      {t("products.view.fields.basePrice")}
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(product.basePrice)}
                    </div>
                  </div>

                  {/* Offer Price */}
                  {product.offerPrice && (
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm text-amber-600 dark:text-amber-400">
                          {t("products.view.fields.offerPrice")}
                        </div>
                        <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                          -{discount}%
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                        {formatCurrency(product.offerPrice)}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t("products.view.save")}{" "}
                        {formatCurrency(
                          (
                            parseFloat(product.basePrice) -
                            parseFloat(product.offerPrice)
                          ).toFixed(2),
                        )}
                      </div>
                    </div>
                  )}

                  {/* SKU */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      {t("products.view.fields.sku")}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-bold text-blue-700 dark:text-blue-300">
                        {product.sku}
                      </div>
                      <button
                        onClick={() => copyToClipboard(product.sku)}
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                        title={t("products.view.buttons.copy")}
                      >
                        {copied ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} className="text-blue-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Features Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
                    <CheckCircle
                      size={20}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("products.view.status.title")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("products.view.status.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {/* Product Status */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          product.isActive
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {product.isActive ? (
                          <CheckCircle size={18} />
                        ) : (
                          <XCircle size={18} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {t("products.view.fields.status")}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {product.isActive
                            ? t("common.active")
                            : t("common.inactive")}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.isActive
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {product.isActive
                        ? t("common.active")
                        : t("common.inactive")}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                      <div
                        className={`p-2 rounded-lg ${
                          product.isFreeDelivery
                            ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-slate-100 dark:bg-slate-500/20 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        <Truck size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {t("products.view.fields.freeDelivery")}
                        </div>
                      </div>
                      {product.isFreeDelivery ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <XCircle size={18} className="text-slate-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                      <div
                        className={`p-2 rounded-lg ${
                          product.isFastShipping
                            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                            : "bg-slate-100 dark:bg-slate-500/20 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        <Truck size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {t("products.view.fields.fastShipping")}
                        </div>
                      </div>
                      {product.isFastShipping ? (
                        <CheckCircle size={18} className="text-blue-500" />
                      ) : (
                        <XCircle size={18} className="text-slate-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                      <div
                        className={`p-2 rounded-lg ${
                          product.ableToGift
                            ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                            : "bg-slate-100 dark:bg-slate-500/20 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        <Gift size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {t("products.view.fields.ableToGift")}
                        </div>
                      </div>
                      {product.ableToGift ? (
                        <CheckCircle size={18} className="text-purple-500" />
                      ) : (
                        <XCircle size={18} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-600 to-violet-600" />
              <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 rounded-lg">
                    <BarChart3
                      size={20}
                      className="text-purple-600 dark:text-purple-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("products.view.statistics.title")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("products.view.statistics.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Total Stock */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                        <Hash
                          size={20}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                          {totalStock}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {t("products.view.stats.totalStock")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Variants Count */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                        <Layers
                          size={20}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {product.variants.length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {t("products.view.stats.totalVariants")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Images Count */}
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                        <ImageIcon
                          size={20}
                          className="text-amber-600 dark:text-amber-400"
                        />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                          {product.images.length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {t("products.view.stats.totalImages")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Creation Date */}
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-500/20 rounded-lg">
                        <Calendar
                          size={20}
                          className="text-slate-600 dark:text-slate-400"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatDate(product.createdAt)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t("products.view.stats.createdAt")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
