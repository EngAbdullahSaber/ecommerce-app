// pages/products/edit/[id].tsx - Update Product Page (Refactored)
"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FormField,
  GenericUpdateForm,
} from "../../components/shared/GenericUpdateForm";
import { z } from "zod";
import {
  Package,
  Tag,
  DollarSign,
  Truck,
  Gift,
  Layers,
  Image as ImageIcon,
  ArrowLeft,
  Filter,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  Info,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import {
  GetSpecifiedMethod,
  UpdateMethod,
  GetPanigationMethod,
} from "../../services/apis/ApiMethod";
import { useQueryClient } from "@tanstack/react-query";
import RichTextEditor from "../../components/shared/RichTextEditor";
import { MultiSelect } from "../../components/shared/MultiSelect";
import { ImageUploader } from "../../components/shared/ImageUploader";

interface FilterValue {
  attributeId: number;
  optionIds: number[];
}

interface VariantAttribute {
  attributeId: number;
  optionId: number;
}

interface VariantImage {
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface ProductVariant {
  id?: string;
  displayOrder: number;
  price?: number;
  offerPrice?: number;
  stockQuantity: number;
  isActive: boolean;
  attributes: VariantAttribute[];
  images: VariantImage[];
}

interface Name {
  english: string;
  arabic: string;
}

interface Brand {
  id: number;
  title: Name;
}

interface Category {
  id: number;
  title: Name;
}

interface Attribute {
  id: number;
  name: Name;
  options: any[];
}

interface ProductImage {
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  isMain: boolean;
  displayOrder: number;
}

interface Product {
  id: number;
  name: Name;
  description: Name;
  features: string;
  brandId: number;
  categoryId: number;
  basePrice: number;
  offerPrice?: number;
  isFreeDelivery: boolean;
  isFastShipping: boolean;
  ableToGift: boolean;
  isActive: boolean;
  stockQuantity: number;
  sku: string;
  images: ProductImage[];
  filterValues: any[];
  variants: any[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Fetch product by ID
const fetchProductById = async (id: string, lang: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/products/${id}`, lang);

    if (!response || !response.data) {
      throw new Error("Product not found");
    }

    const product = response.data as Product;
    console.log("Product data:", product);

    // Transform the data for the form
    const transformedData = {
      id: product.id,
      nameEnglish: product.name?.english || "",
      nameArabic: product.name?.arabic || "",
      descriptionEnglish: product.description?.english || "",
      descriptionArabic: product.description?.arabic || "",
      features: product.features || "",
      brandId: product.brandId?.toString() || "",
      categoryId: product.categoryId?.toString() || "",
      basePrice: product.basePrice
        ? parseFloat(product.basePrice.toString())
        : 0,
      offerPrice: product.offerPrice
        ? parseFloat(product.offerPrice.toString())
        : undefined,
      isFreeDelivery: product.isFreeDelivery ? "true" : "false",
      isFastShipping: product.isFastShipping ? "true" : "false",
      ableToGift: product.ableToGift ? "true" : "false",
      isActive: product.isActive ? "true" : "false",
      stockQuantity: product.stockQuantity || 0,
      sku: product.sku || "",
      mainImage:
        product.images?.find((img) => img.isMain)?.imageUrl ||
        product.images?.find((img) => img.isPrimary)?.imageUrl ||
        "",
      filterValues: product.filterValues?.map((filter: any) => ({
        attributeId: filter.attributeId || filter.attribute?.id || 0,
        optionIds: filter.optionId ? [filter.optionId] : [],
      })) || [{ attributeId: 0, optionIds: [] }],
      variants: product.variants?.map((variant: any) => ({
        id: variant.id?.toString() || Date.now().toString(),
        displayOrder: variant.displayOrder || 1,
        price: variant.price || 0,
        offerPrice: variant.offerPrice || undefined,
        stockQuantity: variant.stockQuantity || 0,
        isActive: variant.isActive !== undefined ? variant.isActive : true,
        sku:
          variant.sku ||
          `VAR-${variant.id || Date.now()}-${variant.displayOrder || 1}`,
        name: variant.name || `Variant ${variant.displayOrder || 1}`,
        attributes: variant.attributes?.map((attr: any) => ({
          attributeId: attr.attributeId || attr.attribute?.id || 0,
          optionId: attr.optionId || attr.option?.id || 0,
        })) || [{ attributeId: 0, optionId: 0 }],
        images:
          variant.images?.map((image: any, index: number) => ({
            imageUrl: image.imageUrl || "",
            altText:
              image.altText ||
              `Variant ${variant.displayOrder || 1} Image ${index + 1}`,
            isPrimary: image.isPrimary || index === 0,
            displayOrder: image.displayOrder || index + 1,
          })) || [],
      })) || [
        {
          id: "1",
          displayOrder: 1,
          price: 0,
          offerPrice: 0,
          stockQuantity: 0,
          isActive: true,
          attributes: [{ attributeId: 0, optionId: 0 }],
          images: [],
        },
      ],
      createdAt: new Date(product.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedAt: product.updatedAt
        ? new Date(product.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Never updated",
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Fetch paginated data for selects
const fetchPaginatedData = async (
  endpoint: string,
  params: any,
  lang: string,
): Promise<any> => {
  try {
    console.log("Fetching paginated data with params:", params);

    const { page, pageSize, search } = params;

    // Extract search term from params
    let searchTerm = "";
    if (search) {
      searchTerm = search;
    } else if (params.name) {
      searchTerm = params.name;
    } else if (params.searchParam) {
      searchTerm = params.searchParam;
    }

    // Call GetPanigationMethod with correct signature
    const response = await GetPanigationMethod(
      endpoint,
      page || 1,
      pageSize || 10,
      lang,
      searchTerm,
    );

    console.log("Response:", response);

    if (!response) {
      throw new Error("Failed to fetch data");
    }

    const data = response.data || [];
    const total = response.meta?.total || data.length || 0;

    return {
      data,
      meta: response.meta || {},
      total,
    };
  } catch (error) {
    console.error("Error fetching paginated data:", error);
    throw error;
  }
};

export default function UpdateProductPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const productId = params.id as string;
  const currentLang = i18n.language || "en";
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  // Fetch attributes for filters
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await GetSpecifiedMethod(
          "/filter-attributes",
          currentLang,
        );
        setAttributes(response?.data || []);
      } catch (error) {
        console.error("Error fetching attributes:", error);
      }
    };
    fetchAttributes();
  }, [currentLang]);

  // Get options for a specific attribute
  const getAttributeOptions = (attributeId: number) => {
    const attribute = attributes.find((attr) => attr.id === attributeId);
    return attribute?.options || [];
  };

  // Custom render functions
  const renderDescriptionField = ({
    value = "",
    onChange,
    disabled,
    error,
  }: any) => (
    <div className="space-y-2">
      <RichTextEditor
        value={value || ""}
        onChange={onChange}
        placeholder={t("products.form.descriptionEnglishPlaceholder")}
        height="200px"
        disabled={disabled}
      />
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t("products.form.descriptionEnglishHelper")}
      </p>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}
    </div>
  );

  const renderFeaturesField = ({
    value = "",
    onChange,
    disabled,
    error,
  }: any) => {
    const handleChange = (htmlContent: string) => {
      onChange(htmlContent);
    };

    const htmlValue = value || "";

    const extractTextFromHtml = (html: string): string => {
      if (!html) return "";
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || "";
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag size={18} className="text-slate-600 dark:text-slate-400" />
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("products.form.features")}
          </label>
        </div>

        <div className="space-y-3">
          <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
            <RichTextEditor
              value={htmlValue}
              onChange={handleChange}
              placeholder={t("products.form.featurePlaceholder")}
              height="200px"
              disabled={disabled}
              toolbarOptions={{
                options: ["bold", "italic", "bulletList", "orderedList"],
                bulletList: {
                  icon: "list",
                  title: "Bullet List",
                },
                orderedList: {
                  icon: "listOrdered",
                  title: "Numbered List",
                },
              }}
              onValidate={(content) => {
                const text = extractTextFromHtml(content);
                if (!text.trim()) {
                  return t("products.form.featureRequired");
                }
                return null;
              }}
            />
          </div>

          {htmlValue && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t("products.form.featurePreview")}
              </label>
              <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: htmlValue }}
                />
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
              {t("products.form.featureFormattingGuide")}
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 ml-4 list-disc">
              <li>{t("products.form.useBulletPoints")}</li>
              <li>{t("products.form.useNumberedLists")}</li>
              <li>{t("products.form.addDescriptions")}</li>
              <li>{t("products.form.htmlWillBePreserved")}</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("products.form.featuresHelper")}
        </p>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  };

  const renderMainImageField = ({
    value = "",
    onChange,
    disabled,
    error,
  }: any) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon size={18} className="text-slate-600 dark:text-slate-400" />
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("products.form.mainImage")}
          <span className="text-red-500 ml-1">*</span>
        </label>
      </div>

      <ImageUploader
        value={value || ""}
        onChange={onChange}
        maxFiles={1}
        accept="image/*"
        helperText={t("products.form.mainImageHelper")}
        uploadEndpoint="/upload/multiple"
        lang={currentLang}
        isMultiple={false}
        disabled={disabled}
      />

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}
    </div>
  );

  const renderFilterValuesField = ({
    value = [],
    onChange,
    disabled,
    error,
  }: any) => {
    const filterValues: FilterValue[] = value || [];

    const addFilterValue = () => {
      onChange([...filterValues, { attributeId: 0, optionIds: [] }]);
    };

    const updateFilterValue = (
      index: number,
      fieldName: keyof FilterValue,
      fieldValue: any,
    ) => {
      const newFilterValues = [...filterValues];
      if (fieldName === "optionIds") {
        newFilterValues[index][fieldName] = Array.isArray(fieldValue)
          ? fieldValue
          : [fieldValue];
      } else {
        newFilterValues[index][fieldName] = fieldValue;
      }
      onChange(newFilterValues);
    };

    const removeFilterValue = (index: number) => {
      const newFilterValues = filterValues.filter((_, i) => i !== index);
      onChange(newFilterValues);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-600 dark:text-slate-400" />
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("products.form.filterValues")}
            </label>
          </div>
          <button
            type="button"
            onClick={addFilterValue}
            disabled={disabled}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
            {t("common.add")}
          </button>
        </div>

        <div className="space-y-4">
          {filterValues.map((filter, index) => (
            <div
              key={index}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("products.form.filter")} {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFilterValue(index)}
                  disabled={disabled}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("products.form.attribute")}
                  </label>
                  <select
                    value={filter.attributeId}
                    onChange={(e) =>
                      updateFilterValue(
                        index,
                        "attributeId",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value={0}>
                      {t("products.form.selectAttribute")}
                    </option>
                    {attributes.map((attr) => (
                      <option key={attr.id} value={attr.id}>
                        {attr.name?.english || attr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("products.form.options")}
                  </label>
                  <MultiSelect
                    options={
                      attributes.find((a) => a.id === filter.attributeId)
                        ?.options || []
                    }
                    value={filter.optionIds}
                    onChange={(values) =>
                      updateFilterValue(index, "optionIds", values)
                    }
                    getOptionLabel={(option) =>
                      option.name?.english || option.name
                    }
                    getOptionValue={(option) => option.id}
                    placeholder={t("products.form.selectOptions")}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("products.form.filterValuesHelper")}
        </p>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  };

  const renderVariantsField = ({
    value = [],
    onChange,
    disabled,
    error,
  }: any) => {
    const variants: ProductVariant[] = value || [
      {
        id: "1",
        displayOrder: 1,
        price: 0,
        offerPrice: 0,
        stockQuantity: 0,
        isActive: true,
        attributes: [{ attributeId: 0, optionId: 0 }],
        images: [],
      },
    ];

    const addVariant = () => {
      const newId = Date.now().toString();
      onChange([
        ...variants,
        {
          id: newId,
          displayOrder: variants.length + 1,
          price: 0,
          offerPrice: 0,
          stockQuantity: 0,
          isActive: true,
          attributes: [{ attributeId: 0, optionId: 0 }],
          images: [],
        },
      ]);
    };

    const updateVariant = (
      index: number,
      fieldName: keyof ProductVariant,
      fieldValue: any,
    ) => {
      const newVariants = [...variants];
      newVariants[index] = {
        ...newVariants[index],
        [fieldName]: fieldValue,
      };
      onChange(newVariants);
    };

    const updateVariantAttribute = (
      variantIndex: number,
      attrIndex: number,
      fieldName: keyof VariantAttribute,
      fieldValue: any,
    ) => {
      const newVariants = [...variants];
      if (!newVariants[variantIndex].attributes[attrIndex]) {
        newVariants[variantIndex].attributes[attrIndex] = {
          attributeId: 0,
          optionId: 0,
        };
      }

      newVariants[variantIndex].attributes[attrIndex][fieldName] = fieldValue;

      if (fieldName === "attributeId") {
        newVariants[variantIndex].attributes[attrIndex].optionId = 0;
      }

      onChange(newVariants);
    };

    const addVariantAttribute = (variantIndex: number) => {
      const newVariants = [...variants];
      newVariants[variantIndex].attributes.push({
        attributeId: 0,
        optionId: 0,
      });
      onChange(newVariants);
    };

    const removeVariant = (index: number) => {
      if (variants.length > 1) {
        const newVariants = variants.filter((_, i) => i !== index);
        const reorderedVariants = newVariants.map((variant, idx) => ({
          ...variant,
          displayOrder: idx + 1,
        }));
        onChange(reorderedVariants);
      }
    };

    const removeVariantAttribute = (
      variantIndex: number,
      attrIndex: number,
    ) => {
      const newVariants = [...variants];
      newVariants[variantIndex].attributes = newVariants[
        variantIndex
      ].attributes.filter((_, i) => i !== attrIndex);

      if (newVariants[variantIndex].attributes.length === 0) {
        newVariants[variantIndex].attributes = [
          { attributeId: 0, optionId: 0 },
        ];
      }

      onChange(newVariants);
    };

    const addVariantImage = (variantIndex: number) => {
      const newVariants = [...variants];
      if (!newVariants[variantIndex].images) {
        newVariants[variantIndex].images = [];
      }
      newVariants[variantIndex].images.push({
        imageUrl: "",
        altText: `Variant ${variants[variantIndex].displayOrder} Image ${
          newVariants[variantIndex].images.length + 1
        }`,
        isPrimary: newVariants[variantIndex].images.length === 0,
        displayOrder: newVariants[variantIndex].images.length + 1,
      });
      onChange(newVariants);
    };

    const updateVariantImage = (
      variantIndex: number,
      imageIndex: number,
      fieldName: keyof VariantImage,
      fieldValue: any,
    ) => {
      const newVariants = [...variants];
      if (!newVariants[variantIndex].images[imageIndex]) return;

      newVariants[variantIndex].images[imageIndex] = {
        ...newVariants[variantIndex].images[imageIndex],
        [fieldName]: fieldValue,
      };

      if (fieldName === "isPrimary" && fieldValue === true) {
        newVariants[variantIndex].images = newVariants[variantIndex].images.map(
          (img, idx) => ({
            ...img,
            isPrimary: idx === imageIndex,
          }),
        );
      }

      onChange(newVariants);
    };

    const removeVariantImage = (variantIndex: number, imageIndex: number) => {
      const newVariants = [...variants];
      newVariants[variantIndex].images = newVariants[
        variantIndex
      ].images.filter((_, i) => i !== imageIndex);

      newVariants[variantIndex].images = newVariants[variantIndex].images.map(
        (img, idx) => ({
          ...img,
          displayOrder: idx + 1,
        }),
      );

      if (
        newVariants[variantIndex].images.length > 0 &&
        !newVariants[variantIndex].images.some((img) => img.isPrimary)
      ) {
        newVariants[variantIndex].images[0].isPrimary = true;
      }

      onChange(newVariants);
    };

    const reorderVariantImages = (
      variantIndex: number,
      oldIndex: number,
      newIndex: number,
    ) => {
      const newVariants = [...variants];
      const images = [...newVariants[variantIndex].images];
      const [removed] = images.splice(oldIndex, 1);
      images.splice(newIndex, 0, removed);

      images.forEach((img, idx) => {
        img.displayOrder = idx + 1;
      });

      newVariants[variantIndex].images = images;
      onChange(newVariants);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-slate-600 dark:text-slate-400" />
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("products.form.variants")}
            </label>
          </div>
          <button
            type="button"
            onClick={addVariant}
            disabled={disabled}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
            {t("common.add")}
          </button>
        </div>

        <div className="space-y-6">
          {variants.map((variant, variantIndex) => (
            <div
              key={variant.id || variantIndex}
              className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Layers
                      size={18}
                      className="text-slate-600 dark:text-slate-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("products.form.variant")} {variant.displayOrder}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t("products.DisplayOrder")}:
                      </span>
                      <input
                        type="number"
                        value={variant.displayOrder}
                        onChange={(e) =>
                          updateVariant(
                            variantIndex,
                            "displayOrder",
                            parseInt(e.target.value),
                          )
                        }
                        min="1"
                        disabled={disabled}
                        className="w-16 px-2 py-1 text-black dark:text-white text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {t("products.form.active")}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateVariant(
                          variantIndex,
                          "isActive",
                          !variant.isActive,
                        )
                      }
                      disabled={disabled}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${variant.isActive ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"} disabled:opacity-50`}
                      aria-label={
                        variant.isActive
                          ? t("common.deactivate")
                          : t("common.activate")
                      }
                    >
                      <div
                        className={`absolute inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-200 ${
                          currentLang === "ar"
                            ? variant.isActive
                              ? "right-1"
                              : "left-1"
                            : variant.isActive
                              ? "left-7"
                              : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(variantIndex)}
                      disabled={disabled}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("products.form.price")}
                  </label>
                  <input
                    type="number"
                    value={variant.price || ""}
                    onChange={(e) =>
                      updateVariant(
                        variantIndex,
                        "price",
                        parseFloat(e.target.value),
                      )
                    }
                    placeholder={t("products.form.pricePlaceholder")}
                    step="0.01"
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("products.form.offerPrice")}
                  </label>
                  <input
                    type="number"
                    value={variant.offerPrice || ""}
                    onChange={(e) =>
                      updateVariant(
                        variantIndex,
                        "offerPrice",
                        parseFloat(e.target.value),
                      )
                    }
                    placeholder={t("products.form.offerPricePlaceholder")}
                    step="0.01"
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("products.form.stockQuantity")}
                  </label>
                  <input
                    type="number"
                    value={variant.stockQuantity}
                    onChange={(e) =>
                      updateVariant(
                        variantIndex,
                        "stockQuantity",
                        parseInt(e.target.value),
                      )
                    }
                    placeholder={t("products.form.stockQuantityPlaceholder")}
                    min="0"
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("products.form.variantImages")}
                  </label>
                  <button
                    type="button"
                    onClick={() => addVariantImage(variantIndex)}
                    disabled={disabled}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    <Plus size={14} />
                    {t("products.form.addImage")}
                  </button>
                </div>

                {variant.images && variant.images.length > 0 ? (
                  <div className="space-y-3">
                    {variant.images.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ImageIcon size={16} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {t("products.form.image")} {image.displayOrder}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {variant.images.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    reorderVariantImages(
                                      variantIndex,
                                      imageIndex,
                                      imageIndex - 1,
                                    )
                                  }
                                  disabled={disabled || imageIndex === 0}
                                  className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded disabled:opacity-50"
                                  title="Move up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    reorderVariantImages(
                                      variantIndex,
                                      imageIndex,
                                      imageIndex + 1,
                                    )
                                  }
                                  disabled={
                                    disabled ||
                                    imageIndex === variant.images.length - 1
                                  }
                                  className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded disabled:opacity-50"
                                  title="Move down"
                                >
                                  ↓
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                removeVariantImage(variantIndex, imageIndex)
                              }
                              disabled={disabled}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              {t("products.form.imageUrl")}
                            </label>
                            <ImageUploader
                              value={image.imageUrl || ""}
                              onChange={(url) =>
                                updateVariantImage(
                                  variantIndex,
                                  imageIndex,
                                  "imageUrl",
                                  url,
                                )
                              }
                              maxFiles={1}
                              accept="image/*"
                              helperText={t("products.form.uploadVariantImage")}
                              uploadEndpoint="/upload/multiple"
                              lang={currentLang}
                              isMultiple={false}
                              disabled={disabled}
                            />
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {t("products.form.altText")}
                              </label>
                              <input
                                type="text"
                                value={image.altText}
                                onChange={(e) =>
                                  updateVariantImage(
                                    variantIndex,
                                    imageIndex,
                                    "altText",
                                    e.target.value,
                                  )
                                }
                                placeholder={t(
                                  "products.form.altTextPlaceholder",
                                )}
                                disabled={disabled}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={image.isPrimary}
                                  onChange={(e) =>
                                    updateVariantImage(
                                      variantIndex,
                                      imageIndex,
                                      "isPrimary",
                                      e.target.checked,
                                    )
                                  }
                                  disabled={disabled}
                                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  {t("products.form.primaryImage")}
                                </span>
                              </label>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {t("products.form.displayOrder")}
                              </label>
                              <input
                                type="number"
                                value={image.displayOrder}
                                onChange={(e) =>
                                  updateVariantImage(
                                    variantIndex,
                                    imageIndex,
                                    "displayOrder",
                                    parseInt(e.target.value),
                                  )
                                }
                                min="1"
                                disabled={disabled}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                    <ImageIcon
                      size={24}
                      className="mx-auto text-slate-400 mb-2"
                    />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("products.form.noVariantImages")}
                    </p>
                    <button
                      type="button"
                      onClick={() => addVariantImage(variantIndex)}
                      disabled={disabled}
                      className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium disabled:opacity-50"
                    >
                      {t("products.form.addFirstImage")}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("products.form.variantAttributes")}
                  </label>
                  <button
                    type="button"
                    onClick={() => addVariantAttribute(variantIndex)}
                    disabled={disabled}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Plus size={14} />
                    {t("common.add")}
                  </button>
                </div>

                <div className="space-y-2">
                  {variant.attributes.map((attr, attrIndex) => (
                    <div
                      key={attrIndex}
                      className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                          {t("products.form.attribute")}
                        </label>
                        <select
                          value={attr.attributeId}
                          onChange={(e) =>
                            updateVariantAttribute(
                              variantIndex,
                              attrIndex,
                              "attributeId",
                              parseInt(e.target.value),
                            )
                          }
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        >
                          <option value={0}>
                            {t("products.form.selectAttribute")}
                          </option>
                          {attributes.map((attribute) => (
                            <option key={attribute.id} value={attribute.id}>
                              {attribute.name?.english || attribute.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1">
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                          {t("products.form.option")}
                        </label>
                        <select
                          value={attr.optionId || ""}
                          onChange={(e) =>
                            updateVariantAttribute(
                              variantIndex,
                              attrIndex,
                              "optionId",
                              e.target.value ? parseInt(e.target.value) : 0,
                            )
                          }
                          disabled={disabled || !attr.attributeId}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {t("products.form.selectOption")}
                          </option>
                          {getAttributeOptions(attr.attributeId).map(
                            (option) => (
                              <option key={option.id} value={option.id}>
                                {option.name?.english || option.name}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      {variant.attributes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeVariantAttribute(variantIndex, attrIndex)
                          }
                          disabled={disabled}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg self-end mb-1 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("products.form.variantsHelper")}
        </p>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  };

  const productFields: FormField[] = [
    // Basic Information Section Header
    {
      name: "basicInfoHeader",
      label: t("products.form.basicInformation"),
      type: "custom",
      cols: 12,
      renderCustom: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
              <Package size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("products.form.productInformation")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("products.form.enterProductDetails")}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "nameEnglish",
      label: t("products.form.productNameEnglish"),
      type: "text",
      placeholder: t("products.form.productNameEnglishPlaceholder"),
      required: true,
      icon: <Package size={18} />,
      cols: 6,
      validation: z.string().min(2, t("products.form.nameMinLength")),
      helperText: t("products.form.productNameEnglishHelper"),
    },
    {
      name: "nameArabic",
      label: t("products.form.productNameArabic"),
      type: "text",
      placeholder: t("products.form.productNameArabicPlaceholder"),
      required: true,
      cols: 6,
      validation: z.string().min(2, t("products.form.nameMinLength")),
      helperText: t("products.form.productNameArabicHelper"),
    },
    {
      name: "sku",
      label: t("products.form.sku"),
      type: "text",
      placeholder: t("products.form.skuPlaceholder"),
      required: true,
      cols: 12,
      validation: z.string().min(2, t("products.form.skuMinLength")),
      helperText: t("products.form.skuHelper"),
    },
    {
      name: "descriptionEnglish",
      label: t("products.form.descriptionEnglish"),
      type: "custom",
      required: true,
      cols: 12,
      renderCustom: renderDescriptionField,
      validation: z.string().min(10, t("products.form.descriptionMinLength")),
    },
    {
      name: "descriptionArabic",
      label: t("products.form.descriptionArabic"),
      type: "custom",
      required: true,
      cols: 12,
      renderCustom: renderDescriptionField,
      validation: z.string().min(10, t("products.form.descriptionMinLength")),
    },
    {
      name: "features",
      label: t("products.form.features"),
      type: "custom",
      cols: 12,
      renderCustom: renderFeaturesField,
      validation: z.string().min(1, t("products.form.featureRequired")),
    },
    {
      name: "brandId",
      label: t("products.form.brand"),
      type: "paginatedSelect",
      required: true,
      placeholder: t("products.form.searchBrand"),
      icon: <Tag size={18} />,
      cols: 6,
      paginatedSelectConfig: {
        endpoint: "/brands",
        searchParam: "name",
        labelKey: "title.english",
        valueKey: "id",
        pageSize: 10,
        debounceTime: 300,
        transformResponse: (data: any) => {
          const brands = data.brands || data.data || data || [];
          return brands.map((brand: any) => ({
            label: `${brand.title?.en || "N/A"} - ${brand.title?.ar || "N/A"}`,
            value: brand.id.toString(),
            rawData: brand,
          }));
        },
      },
      validation: z.string().min(1, t("products.form.selectBrandRequired")),
      helperText: t("products.form.selectBrandHelper"),
    },
    {
      name: "categoryId",
      label: t("products.form.category"),
      type: "paginatedSelect",
      required: true,
      placeholder: t("products.form.searchCategory"),
      icon: <Layers size={18} />,
      cols: 6,
      paginatedSelectConfig: {
        endpoint: "/categories",
        searchParam: "name",
        labelKey: "title.english",
        valueKey: "id",
        pageSize: 10,
        debounceTime: 300,
        transformResponse: (data: any) => {
          const categories = data.categories || data.data || data || [];
          return categories.map((category: any) => ({
            label: `${category.title?.en || "N/A"} - ${category.title?.ar || "N/A"}`,
            value: category.id.toString(),
            rawData: category,
          }));
        },
      },
      validation: z.string().min(1, t("products.form.selectCategoryRequired")),
      helperText: t("products.form.selectCategoryHelper"),
    },
    // Pricing Section Header
    {
      name: "pricingHeader",
      label: t("products.form.pricing"),
      type: "custom",
      cols: 12,
      renderCustom: () => (
        <div className="space-y-3 mb-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
              <DollarSign
                size={20}
                className="text-amber-600 dark:text-amber-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("products.form.pricingInformation")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("products.form.enterPricingDetails")}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "basePrice",
      label: t("products.form.basePrice"),
      type: "number",
      placeholder: t("products.form.basePricePlaceholder"),
      required: true,
      icon: <DollarSign size={18} />,
      cols: 6,
      helperText: t("products.form.basePriceHelper"),
      validation: z.preprocess(
        (val) => (val === "" || val === undefined ? 0 : Number(val)),
        z.number().min(0, t("products.form.priceMustBePositive")),
      ),
    },
    {
      name: "offerPrice",
      label: t("products.form.offerPrice"),
      type: "number",
      placeholder: t("products.form.offerPricePlaceholder"),
      icon: <Tag size={18} />,
      cols: 6,
      helperText: t("products.form.offerPriceHelper"),
      validation: z.preprocess(
        (val) => (val === "" || val === undefined ? undefined : Number(val)),
        z.number().min(0, t("products.form.priceMustBePositive")).optional(),
      ),
    },
    // Shipping Options Section Header
    {
      name: "shippingOptionsHeader",
      label: t("products.form.shippingOptions"),
      type: "custom",
      cols: 12,
      renderCustom: () => (
        <div className="space-y-3 mb-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
              <Truck
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("products.form.shippingOptions")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("products.form.selectShippingOptions")}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "isFreeDelivery",
      label: t("products.form.freeDelivery"),
      type: "radio",
      cols: 6,
      helperText: t("products.form.freeDeliveryHelper"),
      options: [
        {
          label: t("common.yes"),
          value: "true",
          icon: <Truck size={16} />,
        },
        {
          label: t("common.no"),
          value: "false",
          icon: <X size={16} />,
        },
      ],
    },
    {
      name: "isFastShipping",
      label: t("products.form.fastShipping"),
      type: "radio",
      cols: 6,
      helperText: t("products.form.fastShippingHelper"),
      options: [
        {
          label: t("common.yes"),
          value: "true",
          icon: <Truck size={16} />,
        },
        {
          label: t("common.no"),
          value: "false",
          icon: <X size={16} />,
        },
      ],
    },
    {
      name: "ableToGift",
      label: t("products.form.ableToGift"),
      type: "radio",
      cols: 6,
      helperText: t("products.form.ableToGiftHelper"),
      options: [
        {
          label: t("common.yes"),
          value: "true",
          icon: <Gift size={16} />,
        },
        {
          label: t("common.no"),
          value: "false",
          icon: <X size={16} />,
        },
      ],
    },
    {
      name: "isActive",
      label: t("products.form.isActive"),
      type: "radio",
      cols: 6,
      helperText: t("products.form.isActiveHelper"),
      options: [
        {
          label: t("common.active"),
          value: "true",
          icon: <CheckCircle2 size={16} />,
        },
        {
          label: t("common.inactive"),
          value: "false",
          icon: <XCircle size={16} />,
        },
      ],
    },
    {
      name: "stockQuantity",
      label: t("products.form.stockQuantity"),
      type: "number",
      placeholder: t("products.form.stockQuantityPlaceholder"),
      required: true,
      cols: 6,
      validation: z.preprocess(
        (val) => (val === "" || val === undefined ? 0 : Number(val)),
        z.number().min(0, t("products.form.stockMustBePositive")),
      ),
      helperText: t("products.form.stockQuantityHelper"),
    },
    {
      name: "mainImage",
      label: t("products.form.mainImage"),
      type: "custom",
      required: true,
      cols: 12,
      renderCustom: renderMainImageField,
      validation: z.string().min(1, t("products.form.mainImageRequired")),
    },
    {
      name: "filterValues",
      label: t("products.form.filterValues"),
      type: "custom",
      cols: 12,
      renderCustom: renderFilterValuesField,
    },
    {
      name: "variants",
      label: t("products.form.variants"),
      type: "custom",
      cols: 12,
      renderCustom: renderVariantsField,
    },
    // Metadata Section Header
    {
      name: "metadataHeader",
      label: "Metadata",
      type: "custom",
      cols: 12,
      renderCustom: () => (
        <div className="space-y-3 mb-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-500/10 dark:to-gray-500/10 rounded-lg">
              <Info size={20} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("common.metadata")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("products.form.systemInformation")}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    // Read-only Fields
    {
      name: "createdAt",
      label: t("common.createdAt"),
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "📅",
      helperText: t("products.form.createdAtHelper"),
    },
    {
      name: "updatedAt",
      label: t("common.lastUpdated"),
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "🔄",
      helperText: t("products.form.updatedAtHelper"),
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update product called with data:", data);

      // Convert radio button string values to booleans
      const processedData = {
        ...data,
        isFreeDelivery: data.isFreeDelivery === "true",
        isFastShipping: data.isFastShipping === "true",
        ableToGift: data.ableToGift === "true",
        isActive: data.isActive === "true",
      };

      // Prepare filter values
      const validFilterValues = (processedData.filterValues || []).filter(
        (f: FilterValue) => f.attributeId > 0 && f.optionIds.length > 0,
      );

      // Prepare variants
      const validVariants = (processedData.variants || [])
        .map((variant: any) => {
          const flattenedAttributes = variant.attributes
            .filter((attr: any) => attr.attributeId > 0 && attr.optionId > 0)
            .map((attr: any) => ({
              attributeId: attr.attributeId,
              optionId: attr.optionId,
            }));

          return {
            displayOrder: variant.displayOrder || 1,
            price: variant.price || 0,
            offerPrice: variant.offerPrice || undefined,
            stockQuantity: variant.stockQuantity || 0,
            isActive: variant.isActive !== undefined ? variant.isActive : true,

            attributes: flattenedAttributes,
            images: (variant.images || []).map((image: any) => ({
              imageUrl: image.imageUrl || "",
              altText: image.altText || `Variant ${variant.displayOrder} image`,
              isPrimary: image.isPrimary || false,
              displayOrder: image.displayOrder || 1,
            })),
          };
        })
        .filter(
          (v: any) =>
            v.attributes.length > 0 || v.stockQuantity > 0 || v.price > 0,
        );

      const requestData = {
        name: {
          english: processedData.nameEnglish,
          arabic: processedData.nameArabic,
        },
        description: {
          english: processedData.descriptionEnglish,
          arabic: processedData.descriptionArabic,
        },
        features: processedData.features,
        brandId: processedData.brandId
          ? parseInt(processedData.brandId)
          : undefined,
        categoryId: processedData.categoryId
          ? parseInt(processedData.categoryId)
          : undefined,
        basePrice:
          processedData.basePrice !== undefined &&
          processedData.basePrice !== ""
            ? parseFloat(processedData.basePrice)
            : 0,
        offerPrice:
          processedData.offerPrice !== undefined &&
          processedData.offerPrice !== ""
            ? parseFloat(processedData.offerPrice)
            : undefined,
        isFreeDelivery: processedData.isFreeDelivery,
        isFastShipping: processedData.isFastShipping,
        ableToGift: processedData.ableToGift,
        isActive: processedData.isActive,
        filterValues: validFilterValues,
        images: processedData.mainImage
          ? [
              {
                imageUrl: processedData.mainImage,
                altText: processedData.nameEnglish || "Product Image",
                isPrimary: true,
                isMain: true,
                displayOrder: 1,
              },
            ]
          : [],
        variants: validVariants.length > 0 ? validVariants : undefined,
        sku: processedData.sku,
      };

      console.log("Final request data:", requestData);

      const result = await UpdateMethod(
        `/products`,
        requestData,
        id,
        currentLang,
      );

      if (!result) {
        throw new Error(t("products.messages.noResponse"));
      }

      return result;
    } catch (error: any) {
      console.error("Failed to update product:", error);
      throw error;
    }
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["brands"] });

    toast.success(t("products.messages.updateSuccess"), { duration: 2000 });

    setTimeout(() => {
      navigate("/products");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);

    let errorMessage = t("products.messages.updateFailed");
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    toast.error(errorMessage, { duration: 3000 });
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { createdAt, updatedAt, id, ...rest } = data;

    // Ensure brandId and categoryId are numbers
    if (rest.brandId) {
      rest.brandId = parseInt(rest.brandId);
    }
    if (rest.categoryId) {
      rest.categoryId = parseInt(rest.categoryId);
    }

    console.log("After transformation:", rest);
    return rest;
  };

  if (!productId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("products.messages.productNotFound")}
          </h1>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("products.messages.backToProducts")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("products.messages.backToProducts")}
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {t("products.form.editProduct")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("products.form.editProductDetails")}
              </p>
            </div>
          </div>
        </div>

        <GenericUpdateForm
          title={t("products.form.productInformation")}
          description={t("products.form.fillProductDetails")}
          fields={productFields}
          entityId={productId}
          fetchData={(id) => fetchProductById(id, currentLang)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/products")}
          onBack={() => navigate("/products")}
          submitLabel={t("products.form.updateProduct")}
          cancelLabel={t("common.cancel")}
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
          fetchOptions={(endpoint, params) =>
            fetchPaginatedData(endpoint, params, currentLang)
          }
          preventDefaultSubmit={true}
        />
      </div>
    </div>
  );
}
