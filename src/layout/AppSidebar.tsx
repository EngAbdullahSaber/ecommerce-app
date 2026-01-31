import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import {
  FiPackage,
  FiGlobe,
  FiMapPin,
  FiMap,
  FiCalendar,
  FiShoppingBag,
  FiTag,
  FiUsers,
  FiHome,
  FiGrid,
  FiUser,
  FiFileText,
  FiDatabase,
  FiShoppingCart,
  FiLayers,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import { Filter } from "lucide-react";

// Mock components for demonstration
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <FiChevronDown className={className} />
);

const HorizontalDots = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center gap-0.5`}>
    <span className="w-1 h-1 rounded-full bg-current"></span>
    <span className="w-1 h-1 rounded-full bg-current"></span>
    <span className="w-1 h-1 rounded-full bg-current"></span>
  </div>
);

// Mock context
const useSidebar = () => ({
  isExpanded: true,
  isMobileOpen: false,
  isHovered: false,
  setIsHovered: () => {},
});

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

type CategoryItem = {
  name: string;
  path?: string;
  subCategories?: CategoryItem[];
};

// Navigation items are now generated inside AppSidebar component with translations

const CategoryMenuItem: React.FC<{
  item: CategoryItem;
  level?: number;
  isSidebarExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  openCategories: string[];
  onToggle: (name: string) => void;
  isActive: (path: string) => boolean;
}> = ({
  item,
  level = 0,
  isSidebarExpanded,
  isMobileOpen,
  isHovered,
  openCategories,
  onToggle,
  isActive,
}) => {
  const hasChildren = item.subCategories && item.subCategories.length > 0;
  const isOpen = openCategories.includes(item.name);
  const showText = isSidebarExpanded || isHovered || isMobileOpen;

  return (
    <li>
      <div className="relative">
        {item.path ? (
          <Link
            to={item.path}
            className={`flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
              isActive(item.path)
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
            } ${!showText ? "lg:justify-center px-3" : "pr-3"}`}
            style={{
              paddingLeft: showText
                ? `${level * 16 + (level > 0 ? 40 : 12)}px`
                : undefined,
            }}
          >
            {level === 0 && <FiLayers className="w-4 h-4 flex-shrink-0" />}
            {showText && (
              <span className="font-medium text-sm flex-1">{item.name}</span>
            )}
          </Link>
        ) : (
          <button
            onClick={() => onToggle(item.name)}
            className={`flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group w-full relative ${
              isOpen
                ? "bg-gray-100 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
            } ${!showText ? "lg:justify-center px-3" : "pr-3"}`}
            style={{
              paddingLeft: showText
                ? `${level * 16 + (level > 0 ? 40 : 12)}px`
                : undefined,
            }}
          >
            {level === 0 && <FiLayers className="w-4 h-4 flex-shrink-0" />}
            {showText && (
              <>
                <span className="font-medium text-sm flex-1 text-left">
                  {item.name}
                </span>
                {hasChildren && (
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </>
            )}
          </button>
        )}
      </div>
      {hasChildren && isOpen && showText && (
        <ul className="mt-1 space-y-1">
          {item.subCategories!.map((child) => (
            <CategoryMenuItem
              key={child.name}
              item={child}
              level={level + 1}
              isSidebarExpanded={isSidebarExpanded}
              isMobileOpen={isMobileOpen}
              isHovered={isHovered}
              openCategories={openCategories}
              onToggle={onToggle}
              isActive={isActive}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const AppSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { isRTL } = useLanguage();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      icon: <FiHome className="w-5 h-5" />,
      name: t("sidebar.dashboard"),
      path: "/dashboard",
    },
    {
      icon: <FiGlobe className="w-5 h-5" />,
      name: t("sidebar.countries"),
      path: "/countries",
    },
    {
      icon: <FiMapPin className="w-5 h-5" />,
      name: t("sidebar.cities"),
      path: "/cities",
    },
    {
      icon: <FiMap className="w-5 h-5" />,
      name: t("sidebar.areas"),
      path: "/areas",
    },
    {
      icon: <FiCalendar className="w-5 h-5" />,
      name: t("sidebar.events"),
      path: "/events",
    },
    {
      icon: <FiShoppingBag className="w-5 h-5" />,
      name: t("sidebar.stores"),
      path: "/stores",
    },
    {
      icon: <FiTag className="w-5 h-5" />,
      name: t("sidebar.brands"),
      path: "/brands",
    },
    {
      icon: <FiUsers className="w-5 h-5" />,
      name: t("sidebar.merchants"),
      path: "/merchants",
    },
    {
      icon: <FiUsers className="w-5 h-5" />,
      name: t("sidebar.banners"),
      path: "/banners",
    },
    {
      icon: <Filter className="w-5 h-5" />,
      name: t("sidebar.filters"),
      path: "/filters",
    },
    {
      icon: <FiShoppingBag className="w-5 h-5" />,
      name: t("sidebar.products"),
      path: "/products",
    },
    {
      icon: <FiShoppingBag className="w-5 h-5" />,
      name: t("sidebar.promoRules"),
      path: "/promo-rules",
    },
  ];

  const categoryItems: CategoryItem[] = [
    {
      name: t("sidebar.categories"),
      subCategories: [
        {
          name: t("categories.parentCategory"),
          path: "/parent-categories",
        },
        {
          name: t("categories.subCategory"),
          path: "/sub-categories",
        },
        {
          name: t("categories.thirdCategory"),
          path: "/third-categories",
        },
      ],
    },
  ];

  const othersItems: NavItem[] = [];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>([
    t("sidebar.categories"),
  ]);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  useEffect(() => {
    const findAndExpandCategories = (
      items: CategoryItem[],
      path: string,
    ): string[] => {
      for (const item of items) {
        if (item.path === path) {
          return [item.name];
        }
        if (item.subCategories) {
          const childResult = findAndExpandCategories(item.subCategories, path);
          if (childResult.length > 0) {
            return [item.name, ...childResult];
          }
        }
      }
      return [];
    };

    const expandedCategories = findAndExpandCategories(
      categoryItems,
      location.pathname,
    );
    if (expandedCategories.length > 0) {
      setOpenCategories((prev) => [
        ...new Set([...prev, ...expandedCategories]),
      ]);
    }
  }, [location]);

  useEffect(() => {
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = navItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const handleCategoryToggle = (categoryName: string) => {
    setOpenCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((name) => name !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              } w-full`}
            >
              <span
                className={`transition-colors duration-200 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="font-medium text-sm flex-1 text-left">
                  {nav.name}
                </span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-white"
                      : "text-gray-400"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive(nav.path)
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}
              >
                <span
                  className={`transition-colors duration-200 ${
                    isActive(nav.path)
                      ? "text-white"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="font-medium text-sm">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-1 space-y-1 pl-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        isActive(subItem.path)
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <span>{subItem.name}</span>
                      <span className="flex items-center gap-1">
                        {subItem.new && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              isActive(subItem.path)
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                                : "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                            }`}
                          >
                            New
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              isActive(subItem.path)
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                                : "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300"
                            }`}
                          >
                            Pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const renderCategories = () => (
    <div>
      <h2
        className={`mb-3 text-xs uppercase flex leading-[20px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider ${
          !isExpanded && !isHovered
            ? "lg:justify-center"
            : `${isRTL ? "justify-end" : "justify-start"} `
        }`}
      >
        {isExpanded || isHovered || isMobileOpen ? (
          t("sidebar.categories")
        ) : (
          <HorizontalDots className="size-6" />
        )}
      </h2>
      <ul className="flex flex-col gap-1">
        {categoryItems.map((category) => (
          <CategoryMenuItem
            key={category.name}
            item={category}
            isSidebarExpanded={isExpanded}
            isMobileOpen={isMobileOpen}
            isHovered={isHovered}
            openCategories={openCategories}
            onToggle={handleCategoryToggle}
            isActive={isActive}
          />
        ))}
      </ul>
    </div>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col overflow-hidden lg:mt-0 top-0 px-4 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 ${
        isRTL ? "right-0" : "left-0"
      } ${isRTL ? "border-l" : "border-r"} border-gray-200 dark:border-gray-800
        ${
          isExpanded || isMobileOpen
            ? "w-[260px]"
            : isHovered
              ? "w-[260px]"
              : "w-[80px]"
        }
        ${
          isMobileOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full"
              : "-translate-x-full"
        }
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex ${
          !isExpanded && !isHovered
            ? "lg:justify-center"
            : `${isRTL ? "justify-end" : "justify-start"} `
        }`}
      >
        <Link to="/dashboard" className="group">
          <div className="w-24 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-200">
            <img
              src="/logo.png"
              alt="Logo Text"
              className="h-9 w-auto object-contain"
            />{" "}
          </div>
        </Link>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
          transition: background 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.4);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.6);
        }
        
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        
        .dark .custom-scrollbar {
          scrollbar-color: rgba(75, 85, 99, 0.4) transparent;
        }
      `}</style>

      <div className="flex-1 flex flex-col overflow-y-auto duration-300 ease-linear custom-scrollbar">
        <nav className="px-1 pb-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className={`mb-3 text-xs uppercase flex leading-[20px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : `${isRTL ? "justify-end" : "justify-start"} `
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  t("sidebar.mainMenu")
                ) : (
                  <HorizontalDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {renderCategories()}

            <div>
              <h2
                className={`mb-3 text-xs uppercase flex leading-[20px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : `${isRTL ? "justify-end" : "justify-start"} `
                }`}
              ></h2>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
