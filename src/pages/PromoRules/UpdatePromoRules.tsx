// pages/promos/edit/[id].tsx - Update Promo Rule Page (Refactored)
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
  Tag,
  Percent,
  Calendar,
  Plus,
  Trash2,
  ArrowLeft,
  DollarSign,
  Package,
  Truck,
  Info,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import {
  GetSpecifiedMethod,
  UpdateMethod,
} from "../../services/apis/ApiMethod";
import { useQueryClient, useQuery } from "@tanstack/react-query";

// Interfaces
interface Name {
  english: string;
  arabic: string;
}

interface RuleType {
  key: string;
  name: Name;
  description: Name;
  operators: string[];
  valueType: string;
}

interface ActionType {
  key: string;
  name: Name;
  description: Name;
  payloadSchema: Record<string, any>;
}

interface RuleFormData {
  ruleType: string;
  operator: string;
  value: any;
}

interface ActionFormData {
  actionType: string;
  payload: Record<string, any>;
}

interface PromoRule {
  id: number;
  name: string;
  type: "COUPON" | "RULE";
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  coupon: any | null;
  rules: Array<{
    id: number;
    ruleType: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    id: number;
    actionType: string;
    payload: Record<string, any>;
  }>;
  _count: {
    usages: number;
  };
}

// Fetch promo rule by ID
const fetchPromoById = async (
  id: string | number,
  lang: string,
): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/promos/${id}`, lang);

    if (!response || !response.data) {
      throw new Error("Promo rule not found");
    }

    const promo = response.data as PromoRule;

    // Transform the data for the form
    const transformedData = {
      id: promo.id,
      name: promo.name || "",
      type: promo.type || "RULE",
      status: promo.status || "ACTIVE",
      startDate: promo.startDate
        ? new Date(promo.startDate).toISOString().split("T")[0]
        : "",
      endDate: promo.endDate
        ? new Date(promo.endDate).toISOString().split("T")[0]
        : "",
      rules: promo.rules?.map((rule) => ({
        ruleType: rule.ruleType,
        operator: rule.operator,
        value: rule.value,
      })) || [{ ruleType: "", operator: "", value: "" }],
      actions: promo.actions?.map((action) => ({
        actionType: action.actionType,
        payload: action.payload || {},
      })) || [{ actionType: "", payload: {} }],
      couponCode: promo.coupon?.code || null,
      usages: promo._count?.usages || 0,
      createdAt: new Date(promo.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedAt: promo.updatedAt
        ? new Date(promo.updatedAt).toLocaleDateString("en-US", {
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
    console.error("Error fetching promo rule:", error);
    throw error;
  }
};

export default function UpdatePromoRulePage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const promoId = params.id as string;
  const queryClient = useQueryClient();

  // Fetch rule types
  const { data: ruleTypesData } = useQuery({
    queryKey: ["ruleTypes", lang],
    queryFn: async () => {
      const response = await GetSpecifiedMethod("/promos/rule-types", lang);
      return response.data as RuleType[];
    },
  });

  // Fetch action types
  const { data: actionTypesData } = useQuery({
    queryKey: ["actionTypes", lang],
    queryFn: async () => {
      const response = await GetSpecifiedMethod("/promos/action-types", lang);
      return response.data as ActionType[];
    },
  });

  // Helper functions
  const getDefaultValueForType = (valueType: string): any => {
    switch (valueType) {
      case "number":
        return 0;
      case "boolean":
        return true;
      case "array<number>":
        return [];
      default:
        return "";
    }
  };

  // Custom render functions
  const renderRulesField = ({ value = [], onChange, disabled, error }: any) => {
    const rules: RuleFormData[] = value || [
      { ruleType: "", operator: "", value: "" },
    ];

    const addRule = () => {
      onChange([...rules, { ruleType: "", operator: "", value: "" }]);
    };

    const removeRule = (index: number) => {
      if (rules.length > 1) {
        const newRules = rules.filter((_, i) => i !== index);
        onChange(newRules);
      }
    };

    const updateRule = (
      index: number,
      field: keyof RuleFormData,
      value: any,
    ) => {
      const newRules = [...rules];
      newRules[index][field] = value;

      // If ruleType changed, reset operator and value
      if (field === "ruleType") {
        const ruleType = ruleTypesData?.find((rt) => rt.key === value);
        if (ruleType) {
          newRules[index].operator = ruleType.operators[0] || "";
          newRules[index].value = getDefaultValueForType(ruleType.valueType);
        }
      }

      onChange(newRules);
    };

    const renderValueField = (
      ruleIndex: number,
      ruleType: RuleType | undefined,
    ) => {
      if (!ruleType) return null;

      const rule = rules[ruleIndex];
      const valueType = ruleType.valueType;

      switch (valueType) {
        case "number":
          return (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("promos.form.value")}
              </label>
              <input
                type="number"
                value={rule.value || 0}
                onChange={(e) =>
                  updateRule(
                    ruleIndex,
                    "value",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="w-full px-3 text-black dark:text-white py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
                min="0"
                step="0.01"
                disabled={disabled}
              />
            </div>
          );

        case "boolean":
          return (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("promos.form.value")}
              </label>
              <select
                value={rule.value === true ? "true" : "false"}
                onChange={(e) =>
                  updateRule(ruleIndex, "value", e.target.value === "true")
                }
                className="w-full px-3 py-2 border text-black dark:text-white border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
                disabled={disabled}
              >
                <option value="true">{t("promos.form.yes")}</option>
                <option value="false">{t("promos.form.no")}</option>
              </select>
            </div>
          );

        case "array<number>":
          return (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("promos.form.selectItems")}
              </label>
              <input
                type="text"
                placeholder={t("promos.form.enterIds")}
                value={Array.isArray(rule.value) ? rule.value.join(", ") : ""}
                onChange={(e) => {
                  const ids = e.target.value
                    .split(",")
                    .map((id) => parseInt(id.trim()))
                    .filter((id) => !isNaN(id));
                  updateRule(ruleIndex, "value", ids);
                }}
                className="w-full px-3 py-2 text-black dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
                disabled={disabled}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t("promos.form.enterCommaSeparated")}
              </p>
            </div>
          );

        default:
          return null;
      }
    };

    const ruleTypeOptions =
      ruleTypesData?.map((ruleType) => ({
        label: ruleType.name[lang === "ar" ? "arabic" : "english"],
        value: ruleType.key,
        rawData: ruleType,
      })) || [];

    return (
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-lg">
              <Percent size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("promos.form.rules")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("promos.form.updatePromoRules")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={addRule}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50"
          >
            <Plus size={16} />
            {t("promos.form.addRule")}
          </button>
        </div>

        {rules.map((rule, index) => {
          const ruleType = ruleTypesData?.find(
            (rt) => rt.key === rule.ruleType,
          );

          return (
            <div
              key={index}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  {t("promos.form.rule")} #{index + 1}
                </h4>
                {rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    disabled={disabled}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("promos.form.ruleType")}
                  </label>
                  <select
                    value={rule.ruleType}
                    onChange={(e) =>
                      updateRule(index, "ruleType", e.target.value)
                    }
                    className="w-full px-3 py-2 border text-black dark:text-white border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
                    disabled={disabled}
                  >
                    <option value="">{t("promos.form.selectRuleType")}</option>
                    {ruleTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {ruleType && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {
                        ruleType.description[
                          lang === "ar" ? "arabic" : "english"
                        ]
                      }
                    </p>
                  )}
                </div>

                {rule.ruleType && ruleType && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("promos.form.operator")}
                      </label>
                      <select
                        value={rule.operator}
                        onChange={(e) =>
                          updateRule(index, "operator", e.target.value)
                        }
                        className="w-full px-3 text-black dark:text-white py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
                        disabled={disabled}
                      >
                        {ruleType.operators.map((operator) => (
                          <option key={operator} value={operator}>
                            {operator}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>{renderValueField(index, ruleType)}</div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  };

  const renderActionsField = ({
    value = [],
    onChange,
    disabled,
    error,
  }: any) => {
    const actions: ActionFormData[] = value || [
      { actionType: "", payload: {} },
    ];

    const addAction = () => {
      onChange([...actions, { actionType: "", payload: {} }]);
    };

    const removeAction = (index: number) => {
      if (actions.length > 1) {
        const newActions = actions.filter((_, i) => i !== index);
        onChange(newActions);
      }
    };

    const updateAction = (
      index: number,
      field: keyof ActionFormData,
      value: any,
    ) => {
      const newActions = [...actions];
      newActions[index][field] = value;

      // If actionType changed, initialize payload with default values
      if (field === "actionType") {
        const actionType = actionTypesData?.find((at) => at.key === value);
        if (actionType) {
          // Initialize payload with default values based on schema
          const initialPayload: Record<string, any> = {};

          if (actionType.payloadSchema) {
            Object.entries(actionType.payloadSchema).forEach(
              ([field, config]: [string, any]) => {
                if (config.type === "number") {
                  initialPayload[field] = config.min || 0;
                } else if (config.type === "array<number>") {
                  initialPayload[field] = [];
                } else {
                  initialPayload[field] = "";
                }
              },
            );
          }

          newActions[index].payload = initialPayload;
        }
      }

      onChange(newActions);
    };

    const updateActionPayload = (index: number, field: string, value: any) => {
      const newActions = [...actions];
      if (!newActions[index].payload) {
        newActions[index].payload = {};
      }
      newActions[index].payload[field] = value;
      onChange(newActions);
    };

    const renderPayloadFields = (
      actionIndex: number,
      actionType: ActionType | undefined,
    ) => {
      if (!actionType || !actionType.payloadSchema) return null;

      const schema = actionType.payloadSchema;
      const action = actions[actionIndex];

      return Object.entries(schema).map(([field, config]) => {
        const fieldConfig = config as any;
        const isRequired = fieldConfig.required !== false;
        const fieldType = fieldConfig.type || "number";
        const min = fieldConfig.min;
        const max = fieldConfig.max;

        const getFieldLabel = () => {
          const fieldNames: Record<string, string> = {
            percentage: t("promos.form.percentage"),
            maxDiscount: t("promos.form.maxDiscount"),
            amount: t("promos.form.amount"),
            buyQuantity: t("promos.form.buyQuantity"),
            freeQuantity: t("promos.form.freeQuantity"),
            discountPercent: t("promos.form.discountPercent"),
            buyProductIds: t("promos.form.buyProductIds"),
            discountProductIds: t("promos.form.discountProductIds"),
            productIds: t("promos.form.productIds"),
          };
          return fieldNames[field] || field;
        };

        const getPlaceholder = () => {
          if (fieldType.includes("array")) {
            return t("promos.form.enterCommaSeparatedIds");
          }
          if (field === "percentage" || field === "discountPercent") {
            return t("promos.form.enterPercentage");
          }
          return t("promos.form.enterValue");
        };

        if (fieldType.includes("array")) {
          return (
            <div key={field} className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {getFieldLabel()}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={
                  Array.isArray(action.payload[field])
                    ? action.payload[field].join(", ")
                    : ""
                }
                onChange={(e) => {
                  const ids = e.target.value
                    .split(",")
                    .map((id) => parseInt(id.trim()))
                    .filter((id) => !isNaN(id));
                  updateActionPayload(actionIndex, field, ids);
                }}
                className="w-full px-3 text-black dark:text-white py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
                disabled={disabled}
              />
              {min !== undefined && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("promos.form.min")}: {min}
                </p>
              )}
            </div>
          );
        }

        if (fieldType === "number") {
          return (
            <div key={field} className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {getFieldLabel()}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="number"
                placeholder={getPlaceholder()}
                value={
                  action.payload[field] !== undefined
                    ? action.payload[field]
                    : ""
                }
                onChange={(e) =>
                  updateActionPayload(
                    actionIndex,
                    field,
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="w-full text-black dark:text-white px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
                min={min}
                max={max}
                step={
                  field === "percentage" || field === "discountPercent"
                    ? 1
                    : 0.01
                }
                disabled={disabled}
              />
              {min !== undefined && max !== undefined && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("promos.form.range")}: {min} - {max}
                </p>
              )}
            </div>
          );
        }

        return null;
      });
    };

    const actionTypeOptions =
      actionTypesData?.map((actionType) => ({
        label: actionType.name[lang === "ar" ? "arabic" : "english"],
        value: actionType.key,
        rawData: actionType,
      })) || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 rounded-lg">
              <DollarSign
                size={20}
                className="text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("promos.form.actions")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("promos.form.updatePromoActions")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={addAction}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
          >
            <Plus size={16} />
            {t("promos.form.addAction")}
          </button>
        </div>

        {actions.map((action, index) => {
          const actionType = actionTypesData?.find(
            (at) => at.key === action.actionType,
          );

          return (
            <div
              key={index}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  {t("promos.form.action")} #{index + 1}
                </h4>
                {actions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    disabled={disabled}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("promos.form.actionType")}
                  </label>
                  <select
                    value={action.actionType}
                    onChange={(e) =>
                      updateAction(index, "actionType", e.target.value)
                    }
                    className="w-full px-3 text-black dark:text-white py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
                    disabled={disabled}
                  >
                    <option value="">
                      {t("promos.form.selectActionType")}
                    </option>
                    {actionTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {actionType && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {
                        actionType.description[
                          lang === "ar" ? "arabic" : "english"
                        ]
                      }
                    </p>
                  )}
                </div>

                {action.actionType && actionType && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderPayloadFields(index, actionType)}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  };

  const promoFields: FormField[] = [
    // Basic Information Section Header
    {
      name: "basicInfoHeader",
      label: "Basic Information",
      type: "custom",
      cols: 12,
      renderCustom: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
              <Tag size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("promos.form.promoInformation")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("promos.form.updatePromoDetails")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Promo Name (Editable)
    {
      name: "name",
      label: t("promos.form.promoName"),
      type: "text",
      placeholder: "Summer Sale 20% Off",
      required: true,
      icon: <Tag size={18} />,
      cols: 12,
      validation: z.string().min(2, t("promos.form.nameMinLength")),
      helperText: t("promos.form.promoNameHelper"),
    },

    // Dates (Editable)
    {
      name: "startDate",
      label: t("promos.form.startDate"),
      type: "date",
      required: true,
      icon: <Calendar size={18} />,
      cols: 6,
      validation: z.string().min(1, t("promos.form.startDateRequired")),
      helperText: t("promos.form.startDateHelper"),
    },
    {
      name: "endDate",
      label: t("promos.form.endDate"),
      type: "date",
      required: true,
      icon: <Calendar size={18} />,
      cols: 6,
      validation: z.string().min(1, t("promos.form.endDateRequired")),
      helperText: t("promos.form.endDateHelper"),
    },

    // Rules Section
    {
      name: "rules",
      label: t("promos.form.rules"),
      type: "custom",
      cols: 12,
      renderCustom: renderRulesField,
      required: false,
    },

    // Actions Section
    {
      name: "actions",
      label: t("promos.form.actions"),
      type: "custom",
      cols: 12,
      renderCustom: renderActionsField,
      required: false,
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
                {t("promos.form.systemInformation")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    {
      name: "usages",
      label: t("promos.form.totalUsages"),
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "📊",
      helperText: t("promos.form.totalUsagesHelper"),
    },
    {
      name: "createdAt",
      label: t("common.createdAt"),
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "📅",
      helperText: t("promos.form.createdAtHelper"),
    },
    {
      name: "updatedAt",
      label: t("common.lastUpdated"),
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "🔄",
      helperText: t("promos.form.updatedAtHelper"),
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update called with data:", data);

      // Process rules
      const processedRules = data.rules
        .filter((rule: RuleFormData) => rule.ruleType && rule.operator)
        .map((rule: RuleFormData) => {
          const ruleType = ruleTypesData?.find(
            (rt) => rt.key === rule.ruleType,
          );
          let processedValue = rule.value;

          if (
            ruleType?.valueType === "array<number>" &&
            typeof rule.value === "string"
          ) {
            processedValue = rule.value
              .split(",")
              .map((v) => parseInt(v.trim()))
              .filter((v) => !isNaN(v));
          }

          return {
            ruleType: rule.ruleType,
            operator: rule.operator,
            value: processedValue,
          };
        });

      // Process actions
      const processedActions = data.actions
        .filter((action: ActionFormData) => action.actionType)
        .map((action: ActionFormData) => {
          // Clean up payload - remove empty values
          const cleanedPayload = Object.entries(action.payload || {}).reduce(
            (acc, [key, value]) => {
              if (value !== "" && value !== null && value !== undefined) {
                acc[key] = value;
              }
              return acc;
            },
            {} as Record<string, any>,
          );

          return {
            actionType: action.actionType,
            payload: cleanedPayload,
          };
        });

      const requestData = {
        name: data.name,
        status: data.status,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        rules: processedRules,
        actions: processedActions,
      };

      console.log("Sending update request:", requestData);

      const response = await UpdateMethod(`/promos`, requestData, id, lang);

      if (!response) {
        throw new Error("No response from server");
      }

      if (response.code !== 200) {
        throw new Error(
          response.message?.english || response.message || "Update failed",
        );
      }

      return response;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { createdAt, updatedAt, couponCode, usages, type, id, ...rest } =
      data;

    console.log("After transformation:", rest);
    return rest;
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["promos"] });
    queryClient.invalidateQueries({ queryKey: ["promo", promoId] });
    queryClient.invalidateQueries({ queryKey: ["ruleTypes"] });
    queryClient.invalidateQueries({ queryKey: ["actionTypes"] });

    toast.success(t("promos.messages.updateSuccess"), { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/promo-rules");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || t("promos.messages.updateFailed"));
  };

  if (!promoId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-pink-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("promos.messages.promoNotFound")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("promos.messages.promoIdMissing")}
          </p>
          <button
            onClick={() => navigate("/promos")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t("promos.messages.backToPromos")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-pink-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/promo-rules")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("promos.messages.backToPromos")}
        </button>

        <GenericUpdateForm
          title={t("promos.form.updatePromo")}
          description={t("promos.form.editPromoDetails")}
          fields={promoFields}
          entityId={promoId}
          fetchData={(id) => fetchPromoById(id, lang)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/promo-rules")}
          onBack={() => navigate("/promo-rules")}
          submitLabel={t("common.saveChanges")}
          cancelLabel={t("common.cancel")}
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
          preventDefaultSubmit={true}
        />
      </div>
    </div>
  );
}
