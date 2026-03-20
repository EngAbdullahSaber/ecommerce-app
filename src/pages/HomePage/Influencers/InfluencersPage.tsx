import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  RefreshCw,
  Mail,
  Phone,
  Package,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GetSpecifiedMethod, UpdateMethod } from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { motion, AnimatePresence } from "framer-motion";

interface InfluencerProduct {
  id: number;
  product: {
    id: number;
    name: {
      arabic: string;
      english: string;
    };
    basePrice: string;
    offerPrice: string | null;
  };
}

interface Influencer {
  id: number;
  disPlayName: {
    arabic: string;
    english: string;
  };
  image: string;
  isActive: boolean;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  products: InfluencerProduct[];
}

interface InfluencersResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: Influencer[];
}

export default function InfluencersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchInfluencers = async (): Promise<Influencer[]> => {
    try {
      const response = (await GetSpecifiedMethod(
        "home-page/admin/influencers",
        lang
      )) as InfluencersResponse;
      return response.data || [];
    } catch (error) {
      console.error("Error fetching influencers:", error);
      return [];
    }
  };

  const {
    data: influencers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["influencers", lang],
    queryFn: fetchInfluencers,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await UpdateMethod("home-page/admin/influencers", { isActive }, id.toString(), lang);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      toast.success(t("common.success"));
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl transform hover:rotate-6 transition-transform">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("influencers.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("influencers.description")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 active:scale-95"
            >
              <RefreshCw
                size={20}
                className={`${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
              />
              {t("influencers.refresh")}
            </button>

            <button
              onClick={() => navigate("/home-page/influencers/create")}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 active:scale-95"
            >
              <Plus size={20} />
              {t("common.add")}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-[2.5rem] bg-white/50 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-12 text-center border border-red-100 dark:border-red-900/30">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("influencers.errorTitle")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("influencers.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && influencers.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <Users size={64} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("influencers.noInfluencers")}
            </h3>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          <AnimatePresence mode="popLayout">
            {influencers.map((influencer) => (
              <motion.div
                key={influencer.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-700/50 flex flex-col h-full"
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6 z-10">
                  <button
                    onClick={() => toggleStatusMutation.mutate({ id: influencer.id, isActive: !influencer.isActive })}
                    disabled={toggleStatusMutation.isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                      influencer.isActive
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
                        : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${influencer.isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                    {influencer.isActive ? t("influencers.status.active") : t("influencers.status.inactive")}
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative mb-4">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] opacity-0 group-hover:opacity-20 transition-opacity blur-lg" />
                    <img
                      src={influencer.image}
                      alt={lang === "ar" ? influencer.disPlayName?.arabic : influencer.disPlayName?.english}
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-700 shadow-md relative z-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${influencer.disPlayName?.[lang === 'ar' ? 'arabic' : 'english'] || 'I'}&background=random`;
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {lang === "ar" ? influencer.disPlayName?.arabic : influencer.disPlayName?.english}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {influencer.user.firstName} {influencer.user.lastName}
                  </p>
                </div>

                {/* Contact Section */}
                <div className="space-y-3 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                      <Mail size={14} className="text-indigo-500" />
                    </div>
                    <span className="truncate flex-1 font-medium">{influencer.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                      <Phone size={14} className="text-indigo-500" />
                    </div>
                    <span className="font-medium">{influencer.user.phone}</span>
                  </div>
                </div>

                {/* Featured Products */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <Package size={14} />
                    {t("influencers.productsList")}
                  </div>
                  <div className="space-y-2">
                    {influencer.products?.slice(0, 3).map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors shadow-sm"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {lang === "ar" ? prod.product.name.arabic : prod.product.name.english}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {prod.product.offerPrice ? (
                              <>
                                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-black">
                                  {prod.product.offerPrice} SAR
                                </span>
                                <span className="text-slate-400 line-through text-[10px]">
                                  {prod.product.basePrice}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">
                                {prod.product.basePrice} SAR
                              </span>
                            )}
                          </div>
                        </div>
                        <ExternalLink size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    ))}
                    {influencer.products?.length > 3 && (
                      <div className="text-center">
                        <span className="text-[11px] font-bold text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors">
                          + {influencer.products.length - 3} {t("common.more")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative Bottom Bar */}
                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span>ID: #{influencer.id}</span>
                  <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 rounded-md">
                    {influencer.products?.length || 0} Products
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
