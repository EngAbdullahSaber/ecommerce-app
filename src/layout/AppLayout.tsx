import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useLanguage } from "../hooks/useLanguage";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isRTL } = useLanguage();

  return (
    <div
      className={`min-h-screen xl:flex ${isRTL ? "xl:flex-row-reverse" : ""}`}
    >
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 overflow-hidden ease-in-out ${
          isExpanded || isHovered
            ? isRTL
              ? "lg:mr-[260px]"
              : "lg:ml-[260px]"
            : isRTL
            ? "lg:mr-[90px]"
            : "lg:ml-[90px]"
        } ${isMobileOpen ? (isRTL ? "mr-0" : "ml-0") : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
