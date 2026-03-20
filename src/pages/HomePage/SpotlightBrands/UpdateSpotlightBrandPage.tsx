import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Star,
  ArrowLeft,
  Calendar,
  ListOrdered,
  Building2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UpdateMethod,
  GetSpecifiedMethod,
  GetPanigationMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../../components/shared/GenericForm/CreateForm";
import { FormField, PaginatedSelectConfig } from "../../../components/shared/GenericForm";

export default function UpdateSpotlightBrandPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);

  // Fetch brand details
  const { data: brandDetailsResponse, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["spotlight-brand", id, lang],
    queryFn: () => GetSpecifiedMethod(`home-page/admin/spotlight-brands/${id}`, lang),
    enabled: !!id,
  });

  const brandDetails = brandDetailsResponse?.data;

  // Paginated select configuration for brands
  const brandPaginatedConfig: PaginatedSelectConfig = {
    endpoint: "brands",
    searchParam: "name",
    labelKey: "name",
    valueKey: "id",
    pageSize: 10,
    debounceTime: 500,
    transformResponse: (data: any) => {
      const brands = data.brands || data.data || data || [];
      return brands.map((brand: any) => ({
        label: lang === "ar" ? brand.title?.arabic || brand.name : brand.title?.english || brand.name,
        value: brand.id.toString(),
        rawData: brand,
      }));
    },
  };

  const fetchOptions = async (endpoint: string, params: any) => {
    try {
      const response = await GetPanigationMethod(
        endpoint,
        params.page,
        params.pageSize,
        lang,
        params.search || ""
      );
      return response;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  const formFields: FormField[] = [
    {
      name: "brandId",
      label: t("spotlightBrands.create.form.brand"),
      type: "paginatedSelect",
      required: true,
      icon: <Building2 size={18} />,
      cols: 12,
      paginatedSelectConfig: brandPaginatedConfig,
      placeholder: t("spotlightBrands.create.form.brandPlaceholder"),
      validation: z.coerce.number().min(1, t("spotlightBrands.create.validations.brandRequired")),
    },
    {
      name: "displayOrder",
      label: t("spotlightBrands.create.form.displayOrder"),
      type: "number",
      required: true,
      icon: <ListOrdered size={18} />,
      cols: 6,
      placeholder: t("spotlightBrands.create.form.displayOrderPlaceholder"),
      validation: z.coerce.number().min(0, t("spotlightBrands.create.validations.orderMin")),
    },
    {
      name: "dateRange",
      label: t("spotlightBrands.create.form.dateRange"),
      type: "daterange",
      required: true,
      icon: <Calendar size={18} />,
      cols: 6,
      dateRangeConfig: {
        range: true,
        minDate: new Date(2020, 0, 1), // Allow past dates for editing
      },
      validation: z.object({
        startDate: z.date(),
        endDate: z.date(),
      }).refine(
        (data) => data.endDate >= data.startDate,
        t("spotlightBrands.create.validations.endDateAfterStart")
      ),
    },
  ];

  const [defaultValues, setDefaultValues] = useState<any>(null);

  useEffect(() => {
    if (brandDetails) {
      setDefaultValues({
        brandId: brandDetails.brand?.id?.toString() || "",
        displayOrder: brandDetails.displayOrder || 1,
        dateRange: {
          startDate: brandDetails.startDate ? new Date(brandDetails.startDate) : new Date(),
          endDate: brandDetails.endDate ? new Date(brandDetails.endDate) : new Date(),
        },
      });
    }
  }, [brandDetails]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("spotlightBrands.edit.messages.updating"));

    try {
      const payload = {
        brandId: Number(data.brandId),
        displayOrder: Number(data.displayOrder),
        startDate: data.dateRange.startDate.toISOString(),
        endDate: data.dateRange.endDate.toISOString(),
      };

      const response = await UpdateMethod(
        "home-page/admin/spotlight-brands",
        payload,
        id,
        lang
      );

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("spotlightBrands.edit.messages.updateSuccess"));
        
        queryClient.invalidateQueries({ queryKey: ["spotlight-brands"] });
        queryClient.invalidateQueries({ queryKey: ["spotlight-brand", id] });
        
        setTimeout(() => {
          navigate("/home-page/spotlight-brands");
        }, 1500);
      } else {
        throw new Error();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(t("spotlightBrands.edit.messages.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isDetailsLoading || !defaultValues) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t("spotlightBrands.edit.messages.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mb-60 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/home-page/spotlight-brands")}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl">
                <Star size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-slate-100 dark:via-amber-100 dark:to-orange-100 bg-clip-text text-transparent">
                  {t("spotlightBrands.edit.title")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {t("spotlightBrands.edit.subtitle")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <CreateForm
          title={t("spotlightBrands.create.form.title")}
          description={t("spotlightBrands.create.form.description")}
          fields={formFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/home-page/spotlight-brands")}
          submitLabel={t("spotlightBrands.edit.form.actions.update")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="edit"
          fetchOptions={fetchOptions}
        />
      </div>
    </div>
  );
}
