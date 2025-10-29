"use client";

import * as React from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { ScrollArea } from "../scroll-area";
import { Separator } from "../separator";

// ============================================================================
// Types
// ============================================================================

export interface FroxSidebarMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconSrc?: string; // For custom SVG icons
  href?: string;
  children?: FroxSidebarMenuItem[];
  badge?: {
    count?: number;
    color?: "yellow" | "orange" | "pink" | "green" | "blue";
  };
}

export interface FroxSidebarCategory {
  id: string;
  label: string;
  count?: number;
  color?: "yellow" | "orange" | "pink" | "green" | "blue";
  href?: string;
}

export interface FroxSidebarProps {
  /** Logo to display when sidebar is expanded */
  logo?: React.ReactNode;
  /** Logo to display when sidebar is collapsed */
  logoCollapsed?: React.ReactNode;
  /** Navigation menu items */
  menuItems: FroxSidebarMenuItem[];
  /** Secondary menu items (shown after separator) */
  secondaryMenuItems?: FroxSidebarMenuItem[];
  /** Categories section (optional) */
  categories?: FroxSidebarCategory[];
  /** Show categories section */
  showCategories?: boolean;
  /** Show upgrade card at bottom */
  showUpgradeCard?: boolean;
  /** Show dark mode toggle */
  showDarkModeToggle?: boolean;
  /** Current active path */
  activePath?: string;
  /** Callback when menu item is clicked */
  onMenuItemClick?: (item: FroxSidebarMenuItem) => void;
  /** Callback when category is clicked */
  onCategoryClick?: (category: FroxSidebarCategory) => void;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Custom className */
  className?: string;
  /** Children (bottom section content) */
  children?: React.ReactNode;
}

// ============================================================================
// Main Component
// ============================================================================

export const FroxSidebar = React.forwardRef<HTMLElement, FroxSidebarProps>(
  (
    {
      logo,
      logoCollapsed,
      menuItems,
      secondaryMenuItems = [],
      categories = [],
      showCategories = false,
      showUpgradeCard = false,
      showDarkModeToggle = true,
      activePath,
      onMenuItemClick,
      onCategoryClick,
      defaultCollapsed = false,
      collapsed: controlledCollapsed,
      onCollapsedChange,
      className,
      children,
    },
    ref
  ) => {
    // State management
    const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
    const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

    const handleToggleCollapse = () => {
      const newValue = !isCollapsed;
      setInternalCollapsed(newValue);
      onCollapsedChange?.(newValue);
    };

    return (
      <aside
        ref={ref}
        className={cn(
          "relative flex flex-col justify-between bg-white border-r border-neutral dark:bg-dark-neutral-bg dark:border-dark-neutral-border transition-all duration-300 min-h-screen",
          isCollapsed ? "w-32" : "w-[257px]",
          className
        )}
      >
        {/* Collapse/Expand Button - Hidden on mobile, visible on desktop */}
        <button
          type="button"
          onClick={handleToggleCollapse}
          className={cn(
            "absolute p-2 border-neutral right-0 border bg-white rounded-full cursor-pointer duration-300 translate-x-1/2 hover:opacity-75 dark:bg-dark-neutral-bg dark:border-dark-neutral-border z-10",
            "top-6",
            "hidden lg:block"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 text-gray-500 dark:text-gray-dark-500 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
        </button>

        {/* Content Container */}
        <div className="flex flex-col h-full p-[25px] overflow-hidden">
          {/* Logo Section */}
          <div className="mb-10 shrink-0">
            {isCollapsed ? (
              <div className="flex justify-center">{logoCollapsed || logo}</div>
            ) : (
              <div>{logo}</div>
            )}
          </div>

          {/* Menu Section */}
          <ScrollArea className="flex-1 -mx-[25px] px-[25px] overflow-y-auto">
            <div className="pt-[35px] lg:pt-[35px] pb-[18px] space-y-1">
              {menuItems.map((item) => (
                <FroxSidebarItem
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                  activePath={activePath}
                  onItemClick={onMenuItemClick}
                />
              ))}
            </div>

            {/* Secondary Menu Items Section */}
            {secondaryMenuItems.length > 0 && (
              <>
                <Separator className="w-full bg-neutral h-[1px] mb-[21px] dark:bg-dark-neutral-border" />
                <div className="pb-[18px] space-y-1">
                  {secondaryMenuItems.map((item) => (
                    <FroxSidebarItem
                      key={item.id}
                      item={item}
                      isCollapsed={isCollapsed}
                      activePath={activePath}
                      onItemClick={onMenuItemClick}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Dark Mode Toggle Section (after separator) */}
            {showDarkModeToggle && (
              <>
                <Separator className="w-full bg-neutral h-[1px] mb-[21px] dark:bg-dark-neutral-border" />
                {isCollapsed ? (
                  <FroxDarkModeToggleMinimized />
                ) : (
                  <div className="rounded-xl bg-neutral pt-4 flex items-center gap-5 pr-[18px] pb-[13px] pl-[19px] dark:bg-dark-neutral-border mb-4">
                    <FroxDarkModeToggle />
                  </div>
                )}
              </>
            )}

            {/* Upgrade Card Section */}
            {showUpgradeCard && !isCollapsed && (
              <>
                <Separator className="w-full bg-neutral h-[1px] my-[35px] dark:bg-dark-neutral-border" />
                <div className="upgrade-card">
                  <div className="rounded-xl bg-neutral py-5 flex flex-col gap-5 px-[31px] dark:bg-dark-neutral-border">
                    <p className="text-desc text-center text-gray-1100 font-normal mx-auto max-w-[15ch] dark:text-gray-dark-1100">
                      Unlock more features by upgrading to{" "}
                      <span className="font-bold">PRO</span>
                    </p>
                    <button
                      type="button"
                      className="normal-case h-fit min-h-fit transition-all duration-300 border-4 bg-color-brands hover:bg-color-brands hover:border-[#B2A7FF] dark:hover:border-[#B2A7FF] px-5 block border-neutral py-[7px] dark:border-dark-neutral-border text-white rounded-lg font-semibold"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </>
            )}
          </ScrollArea>
        </div>

        {/* Bottom Section */}
        <div className="shrink-0">
          {children}
        </div>
      </aside>
    );
  }
);

FroxSidebar.displayName = "FroxSidebar";

// ============================================================================
// Sidebar Item Component (with submenu support)
// ============================================================================

interface FroxSidebarItemProps {
  item: FroxSidebarMenuItem;
  isCollapsed: boolean;
  activePath?: string;
  onItemClick?: (item: FroxSidebarMenuItem) => void;
}

const FroxSidebarItem: React.FC<FroxSidebarItemProps> = ({
  item,
  isCollapsed,
  activePath,
  onItemClick,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activePath === item.href;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onItemClick?.(item);
    }
  };

  return (
    <div className="sidemenu-item rounded-xl relative">
      {/* Main Item */}
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex items-center w-full cursor-pointer py-[17px] px-[21px] focus:outline-none rounded-xl transition-all duration-300",
          isCollapsed ? "justify-center" : "justify-between",
          isActive && "bg-color-brands",
          !isActive && "hover:bg-gray-100 dark:hover:bg-gray-dark-100"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <div className={cn("flex items-center gap-[10px]", isCollapsed && "justify-center")}>
          {/* Icon */}
          {item.icon && (
            <item.icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors duration-300",
                isActive ? "text-white" : "text-gray-500 dark:text-gray-dark-500"
              )}
            />
          )}
          {item.iconSrc && (
            <img
              src={item.iconSrc}
              alt={`${item.label} icon`}
              className={cn(
                "h-5 w-5 shrink-0 transition-all duration-300",
                isActive && "brightness-0 invert"
              )}
            />
          )}

          {/* Label */}
          {!isCollapsed && (
            <span
              className={cn(
                "text-normal font-semibold sidemenu-title transition-colors duration-300",
                isActive ? "text-white" : "text-gray-500 dark:text-gray-dark-500"
              )}
            >
              {item.label}
            </span>
          )}
        </div>

        {/* Caret Icon (for items with children) */}
        {hasChildren && !isCollapsed && (
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-150",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Submenu (children) */}
      {hasChildren && isExpanded && !isCollapsed && (
        <div className="mt-1">
          <ul className="text-gray-300 child-menu z-10 pl-[53px] space-y-2">
            {item.children?.map((child) => (
              <li
                key={child.id}
                className="pb-2 transition-opacity duration-150 hover:opacity-75"
              >
                <button
                  type="button"
                  onClick={() => onItemClick?.(child)}
                  className={cn(
                    "text-normal text-gray-500 dark:text-gray-dark-500 hover:text-gray-1100 dark:hover:text-gray-dark-1100",
                    activePath === child.href && "text-color-brands font-semibold"
                  )}
                >
                  {child.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Dark Mode Toggle Component
// ============================================================================

const FroxDarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newMode));
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Sun Icon */}
      <button
        type="button"
        onClick={() => isDark && toggleDarkMode()}
        className="sun-icon cursor-pointer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>

      {/* Toggle Switch */}
      <label className="flex items-center cursor-pointer" htmlFor="theme-toggle">
        <div className="relative">
          <input
            type="checkbox"
            id="theme-toggle"
            className="sr-only peer"
            checked={isDark}
            onChange={toggleDarkMode}
          />
          <div className="block rounded-full w-[48px] h-[16px] bg-gray-300 peer-checked:bg-[#B2A7FF]" />
          <div className="dot absolute rounded-full transition h-[24px] w-[24px] top-[-4px] left-[-4px] bg-[#B2A7FF] peer-checked:bg-color-brands peer-checked:translate-x-[32px]" />
        </div>
      </label>

      {/* Moon Icon */}
      <button
        type="button"
        onClick={() => !isDark && toggleDarkMode()}
        className="moon-icon cursor-pointer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>

      {/* Fullscreen Button */}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined') {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
        }}
        className="fullscreen-icon cursor-pointer"
        title="Toggle fullscreen"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>
    </div>
  );
};

// ============================================================================
// Dark Mode Toggle Minimized Component (for collapsed sidebar)
// ============================================================================

const FroxDarkModeToggleMinimized: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // Check if dark mode is enabled on mount
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (typeof window !== 'undefined') {
      if (!isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-3">
      {/* Sun Icon */}
      <button
        type="button"
        onClick={() => isDark && toggleDarkMode()}
        className="sun-icon cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-dark-100 rounded-lg transition-colors"
        title="Light mode"
      >
        <svg
          className="w-5 h-5 text-gray-500 dark:text-gray-dark-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>

      {/* Moon Icon */}
      <button
        type="button"
        onClick={() => !isDark && toggleDarkMode()}
        className="moon-icon cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-dark-100 rounded-lg transition-colors"
        title="Dark mode"
      >
        <svg
          className="w-5 h-5 text-gray-500 dark:text-gray-dark-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>

      {/* Fullscreen Button */}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined') {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
        }}
        className="fullscreen-icon cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-dark-100 rounded-lg transition-colors"
        title="Toggle fullscreen"
      >
        <svg
          className="w-5 h-5 text-gray-500 dark:text-gray-dark-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>
    </div>
  );
};
