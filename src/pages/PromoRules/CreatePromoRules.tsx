// pages/create-promo-rule.tsx
"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  GenericForm,
  FormField,
  PaginatedSelectConfig,
} from "../../components/shared/GenericForm";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CreateMethod,
  GetPanigationMethod,
  GetSpecifiedMethod,
} from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient, useQuery } from "@tanstack/react-query";

interface RuleType {
  key: string;
  name: {
    arabic: string;
    english: string;
  };
  description: {
    arabic: string;
    english: string;
  };
  operators: string[];
  valueType: string;
}

interface ActionType {
  key: string;
  name: {
    arabic: string;
    english: string;
  };
  description: {
    arabic: string;
    english: string;
  };
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

export default function CreatePromoRules() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [rules, setRules] = useState<RuleFormData[]>([
    { ruleType: "", operator: "", value: "" },
  ]);
  const [actions, setActions] = useState<ActionFormData[]>([
    { actionType: "", payload: {} },
  ]);
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType | null>(
    null,
  );
  const [selectedActionType, setSelectedActionType] =
    useState<ActionType | null>(null);
  const [selectedActionTypes, setSelectedActionTypes] = useState<ActionType[]>(
    [],
  );

  // Fetch rule types
  const { data: ruleTypesData } = useQuery({
    queryKey: ["ruleTypes"],
    queryFn: async () => {
      const response = await GetSpecifiedMethod("/promos/rule-types", lang);
      return response.data as RuleType[];
    },
  });

  // Fetch action types
  const { data: actionTypesData } = useQuery({
    queryKey: ["actionTypes"],
    queryFn: async () => {
      const response = await GetSpecifiedMethod("/promos/action-types", lang);
      return response.data as ActionType[];
    },
  });

  const ruleTypeOptions =
    ruleTypesData?.map((ruleType) => ({
      label: ruleType.name[lang === "ar" ? "arabic" : "english"],
      value: ruleType.key,
      rawData: ruleType,
    })) || [];

  const actionTypeOptions =
    actionTypesData?.map((actionType) => ({
      label: actionType.name[lang === "ar" ? "arabic" : "english"],
      value: actionType.key,
      rawData: actionType,
    })) || [];

  const addRule = () => {
    setRules([...rules, { ruleType: "", operator: "", value: "" }]);
  };

  const removeRule = (index: number) => {
    if (rules.length > 1) {
      const newRules = rules.filter((_, i) => i !== index);
      setRules(newRules);
    }
  };

  const updateRule = (index: number, field: keyof RuleFormData, value: any) => {
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

    setRules(newRules);
  };

  const addAction = () => {
    setActions([...actions, { actionType: "", payload: {} }]);
  };

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      const newActions = actions.filter((_, i) => i !== index);
      setActions(newActions);
      const newSelectedTypes = selectedActionTypes.filter(
        (_, i) => i !== index,
      );
      setSelectedActionTypes(newSelectedTypes);
    }
  };

  const updateAction = (
    index: number,
    field: keyof ActionFormData,
    value: any,
  ) => {
    const newActions = [...actions];
    newActions[index][field] = value;

    // If actionType changed, reset payload
    if (field === "actionType") {
      const actionType = actionTypesData?.find((at) => at.key === value);
      if (actionType) {
        newActions[index].payload = {};
        const newSelectedTypes = [...selectedActionTypes];
        newSelectedTypes[index] = actionType;
        setSelectedActionTypes(newSelectedTypes);
      }
    }

    setActions(newActions);
  };

  const updateActionPayload = (index: number, field: string, value: any) => {
    const newActions = [...actions];
    if (!newActions[index].payload) {
      newActions[index].payload = {};
    }
    newActions[index].payload[field] = value;
    setActions(newActions);
  };

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
                updateRule(ruleIndex, "value", parseFloat(e.target.value))
              }
              className="w-full px-3 text-black dark:text-white py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
              min="0"
              step="0.01"
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
              value={action.payload[field] || ""}
              onChange={(e) =>
                updateActionPayload(
                  actionIndex,
                  field,
                  parseFloat(e.target.value),
                )
              }
              className="w-full text-black dark:text-white px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
              min={min}
              max={max}
              step={
                field === "percentage" || field === "discountPercent" ? 1 : 0.01
              }
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

  const promoFields: FormField[] = [
    {
      name: "basicInfoHeader",
      label: t("promos.form.basicInformation"),
      type: "custom",
      cols: 12,
      render: () => (
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
                {t("promos.form.enterPromoDetails")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    {
      name: "name",
      label: t("promos.form.promoName"),
      type: "text",
      placeholder: t("promos.form.promoNamePlaceholder"),
      required: true,
      icon: <Tag size={18} />,
      cols: 12,
      validation: z.string().min(2, t("promos.form.nameMinLength")),
      helperText: t("promos.form.promoNameHelper"),
    },

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

    {
      name: "rulesSection",
      label: t("promos.form.rules"),
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-lg">
                <Percent
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t("promos.form.rules")}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("promos.form.definePromoRules")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={addRule}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all"
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
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
                      className="w-full px-3 py-2 border  border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800"
                    >
                      <option value="">
                        {t("promos.form.selectRuleType")}
                      </option>
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
        </div>
      ),
    },

    {
      name: "actionsSection",
      label: t("promos.form.actions"),
      type: "custom",
      cols: 12,
      render: () => (
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
                  {t("promos.form.definePromoActions")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={addAction}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
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
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
        </div>
      ),
    },
  ];

  const defaultValues = {
    name: "",
    type: "RULE",
    status: "ACTIVE",
    startDate: "",
    endDate: "",
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("promos.messages.creating"));

    try {
      // Validate rules
      const validRules = rules.filter((rule) => rule.ruleType && rule.operator);
      if (validRules.length === 0) {
        throw new Error(t("promos.form.atLeastOneRuleRequired"));
      }

      // Validate actions
      const validActions = actions.filter((action) => action.actionType);
      if (validActions.length === 0) {
        throw new Error(t("promos.form.atLeastOneActionRequired"));
      }

      // Process rules
      const processedRules = validRules.map((rule) => {
        const ruleType = ruleTypesData?.find((rt) => rt.key === rule.ruleType);
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
      const processedActions = validActions.map((action) => {
        return {
          actionType: action.actionType,
          payload: action.payload,
        };
      });

      const requestData = {
        name: data.name,
        type: "RULE",
        status: "ACTIVE",
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        rules: processedRules,
        actions: processedActions,
      };

      const result = await CreateMethod("/promos", requestData, lang);

      if (!result) {
        throw new Error(t("promos.messages.noResponse"));
      }

      toast.dismiss(loadingToast);
      toast.success(t("promos.messages.createSuccess"), { duration: 2000 });

      queryClient.invalidateQueries({ queryKey: ["promos"] });

      setTimeout(() => {
        navigate("/promo-rules");
      }, 1500);

      return result;
    } catch (error: any) {
      console.error("Failed to create promo rule:", error);
      toast.dismiss(loadingToast);

      let errorMessage = t("promos.messages.createFailed");

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage, { duration: 3000 });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-pink-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/promo-rules")}
          disabled={isLoading}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("promos.messages.backToPromos")}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
              <Tag size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 dark:from-slate-100 dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent">
                {t("promos.form.addNewPromo")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("promos.form.createNewPromoRule")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <GenericForm
          title={t("promos.form.promoInformation")}
          description={t("promos.form.fillPromoDetails")}
          fields={promoFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/promo-rules")}
          submitLabel={t("promos.form.createPromo")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
          className="group"
        />
      </div>
    </div>
  );
}
