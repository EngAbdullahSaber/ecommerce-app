import SignInForm from "../../components/auth/SignInForm";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

// Main Auth Layout Component
export default function AuthLayout() {
  return (
    <div className="relative bg-white dark:bg-gray-900 min-h-screen">
      <div className="relative flex flex-col lg:flex-row min-h-screen">
        {/* Sign In Form - Left Side */}
        <div className="flex items-center justify-center w-full lg:w-1/2 min-h-screen">
          <SignInForm />
        </div>

        {/* Branding Panel - Right Side */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-brand-950 via-brand-900 to-purple-950 dark:from-gray-950 dark:via-brand-950 dark:to-gray-900 relative overflow-hidden min-h-screen">
          {/* Grid Background */}
          <GridShape />

          {/* Content Container */}
          <div className="relative z-10 flex items-center justify-center w-full min-h-screen p-8">
            <div className="flex flex-col items-center   w-full">
              {/* Logo */}
              <div className="mb-10 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
                <svg
                  className="w-20 h-20 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              {/* Headline */}
              <h2 className="text-4xl font-bold text-white text-center mb-4 leading-tight">
                Power Your Ecommerce
              </h2>
              <p className="text-center text-gray-300 text-lg mb-10 max-w-sm">
                Advanced dashboard for managing products, orders, and analytics
              </p>

              {/* Feature List */}
              <div className="space-y-5 w-full max-w-sm">
                {[
                  {
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    ),
                    title: "Real-time Analytics",
                    desc: "Live sales tracking and performance insights",
                  },
                  {
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    ),
                    title: "Secure Platform",
                    desc: "Enterprise-grade security & encryption",
                  },
                  {
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    ),
                    title: "Order Management",
                    desc: "Automated fulfillment & inventory sync",
                  },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-500/30 to-purple-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {feature.icon}
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-gray-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-sm">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-white">5,000+</div>
                  <div className="text-xs text-gray-400">Stores</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs text-gray-400">Support</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-xs text-gray-400">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Toggler */}
        <div className="fixed z-50 bottom-6 right-6">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
