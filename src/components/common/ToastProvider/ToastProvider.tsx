// components/common/ToastProvider.jsx
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

const ToastProvider = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={4}
        containerStyle={{
          top: 24,
          zIndex: 999999, // Ensure it's above everything
        }}
        toastOptions={{
          duration: 1500,
          className: "minimal-toast",
          style: {
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: "500",
            maxWidth: "300px",
            margin: "0 auto",
            borderRadius: "8px",
            border: "1px solid",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 999999, // Double ensure
          },

          success: {
            style: {
              background: "#f0fdf4",
              color: "#166534",
              borderColor: "#bbf7d0",
            },
            icon: "✓",
          },

          error: {
            duration: 2000,
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              borderColor: "#fecaca",
            },
            icon: "✕",
          },

          loading: {
            duration: Infinity,
            style: {
              background: "#eff6ff",
              color: "#1e40af",
              borderColor: "#bfdbfe",
            },
            icon: (
              <div className="toast-spinner">
                <div className="spinner"></div>
              </div>
            ),
          },

          custom: {
            style: {
              background: "#faf5ff",
              color: "#7c3aed",
              borderColor: "#e9d5ff",
            },
          },
        }}
      />

      <style>{`
        /* Toast Container - Force above everything */
        .Toastify__toast-container {
          z-index: 999999 !important;
        }
        
        .Toastify__toast {
          z-index: 999999 !important;
        }
        
        /* Minimal Animations */
        .minimal-toast {
          animation: fadeInUp 0.2s ease-out forwards;
          z-index: 999999 !important;
          position: relative;
        }
        
        .minimal-toast[data-status="exiting"] {
          animation: fadeOut 0.2s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
        }
        
        /* Progress Indicator */
        .minimal-toast::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: currentColor;
          opacity: 0.3;
          animation: shrinkWidth linear forwards;
          transform-origin: left;
          border-radius: 8px 8px 0 0;
        }
        
        .minimal-toast[data-duration="1500"]::before {
          animation-duration: 1.5s;
        }
        
        .minimal-toast[data-duration="2000"]::before {
          animation-duration: 2s;
        }
        
        @keyframes shrinkWidth {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        
        /* Loading Spinner */
        .toast-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .toast-spinner .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(30, 64, 175, 0.3);
          border-top-color: rgb(30, 64, 175);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Icon Animations */
        .minimal-toast[data-type="success"] .Toastify__toast-icon {
          animation: bounce 0.3s ease;
        }
        
        .minimal-toast[data-type="error"] .Toastify__toast-icon {
          animation: shake 0.3s ease;
        }
        
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        /* Hover Effect */
        .minimal-toast:hover {
          transform: translateY(-1px);
          transition: transform 0.2s ease;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .minimal-toast[data-type="success"] {
            background: #052e16 !important;
            color: #86efac !important;
            border-color: #166534 !important;
            box-shadow: 0 4px 20px rgba(6, 78, 59, 0.3) !important;
          }
          
          .minimal-toast[data-type="error"] {
            background: #450a0a !important;
            color: #fca5a5 !important;
            border-color: #991b1b !important;
            box-shadow: 0 4px 20px rgba(127, 29, 29, 0.3) !important;
          }
          
          .minimal-toast[data-type="loading"] {
            background: #172554 !important;
            color: #93c5fd !important;
            border-color: #1e40af !important;
            box-shadow: 0 4px 20px rgba(30, 64, 175, 0.3) !important;
          }
          
          .toast-spinner .spinner {
            border: 2px solid rgba(147, 197, 253, 0.3);
            border-top-color: rgb(147, 197, 253);
          }
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .minimal-toast {
            max-width: calc(100vw - 32px) !important;
            font-size: 12px !important;
            padding: 8px 12px !important;
            margin: 0 16px !important;
          }
          
          .Toastify__toast-container {
            padding: 0 !important;
            width: 100% !important;
            left: 0 !important;
            right: 0 !important;
          }
        }
        
        /* Ensure toast appears above modals/dialogs */
        body {
          position: relative;
        }
        
        body > div:last-child {
          z-index: 999999 !important;
        }
      `}</style>
    </>
  );
};

export default ToastProvider;
