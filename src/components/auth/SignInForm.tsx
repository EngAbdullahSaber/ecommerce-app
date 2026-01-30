import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreateMethod } from "../../services/apis/ApiMethod";
import { storeAuthInfo } from "../../services/utils";
import { useToast } from "../../hooks/useToast";

interface FormData {
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    token: string;
    user: any;
  };
}

// Constants
const DEMO_CREDENTIALS = {
  email: "john5.doe@example.com",
  password: "12345678",
} as const;

const INITIAL_FORM_STATE: FormData = {
  email: "",
  password: "",
};

export default function SignInForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // State management
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>(INITIAL_FORM_STATE);

  // Load remembered email on mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      toast.error(t("messages.required"));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t("messages.invalidEmail"));
      return false;
    }

    return true;
  };

  const handleRememberMe = () => {
    if (rememberMe) {
      localStorage.setItem("remembered_email", formData.email);
    } else {
      localStorage.removeItem("remembered_email");
    }
  };

  const handleSuccessfulLogin = (response: LoginResponse) => {
    const { token, user } = response.data;

    // Store authentication info
    storeAuthInfo({ token, user, rememberMe });
    handleRememberMe();

    // Show success message
    const message = rememberMe
      ? t("auth.signInSuccess")
      : t("auth.signInSuccess");

    toast.success(message, { duration: 2000 });

    // Navigate to dashboard
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const handleLoginError = (error: any) => {
    console.error("Login error:", error);

    if (error.response) {
      const { status, data } = error.response;
      const errorMessages: Record<number, string> = {
        404: t("messages.loadingError"),
        401: t("messages.invalidEmail"),
        400: data.message || t("messages.error"),
        500: t("messages.error"),
      };

      toast.error(
        errorMessages[status] ||
          data.message ||
          `${t("messages.error")} ${status}`,
      );
    } else if (error.request) {
      toast.error(t("messages.loadingError"));
    } else {
      toast.error(`${t("messages.error")}: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Signing in...");

    try {
      const response = await CreateMethod(
        "/users/admin/login",
        formData,
        currentLang,
      );

      if (response?.data) {
        toast.dismiss(loadingToast);
        handleSuccessfulLogin(response);
      } else {
        toast.dismiss(loadingToast);
        toast.error(t("messages.error"));
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    toast.custom(
      `${t("common.password")} ${showPassword ? "hidden" : "visible"}`,
    );
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);

    if (isChecked && formData.email) {
      toast.success(t("messages.success"));
    } else if (!isChecked) {
      toast.info(t("messages.info"));
    }
  };

  return (
    <div className="flex items-center justify-center w-2/3 py-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("common.welcome")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("auth.signIn")} {t("common.dashboard")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("auth.email")}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@company.com"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                disabled={isLoading}
                aria-label={
                  showPassword ? t("auth.password") : t("auth.password")
                }
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="w-4 h-4 text-brand-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-brand-500 cursor-pointer"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t("auth.rememberMe")}
                <span className="text-xs text-gray-500 ml-1">
                  ({rememberMe ? t("auth.signIn") : t("auth.logout")})
                </span>
              </span>
            </label>
            <Link
              to="/reset-password"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
              onClick={() => toast.info(t("messages.info"))}
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-semibold rounded-lg shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("common.loading")}</span>
              </>
            ) : (
              <span>{t("auth.signIn")}</span>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                {t("messages.success")}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {t("messages.success")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
