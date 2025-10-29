"use client";

import * as React from "react";
import { Search, Mic, ChevronDown, Menu } from "lucide-react";
import { cn } from "../../lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface FroxNotificationProps {
  count?: number;
  color?: "fuchsia" | "red" | "blue" | "green" | "yellow";
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

export interface FroxDropdownAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconSrc?: string;
  onClick?: () => void;
  href?: string;
}

export interface FroxHeaderProps {
  /** Logo element (hidden on desktop when sidebar is visible) */
  logo?: React.ReactNode;
  /** Show logo in header */
  showLogo?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Search value */
  searchValue?: string;
  /** Search onChange callback */
  onSearchChange?: (value: string) => void;
  /** Show search bar */
  showSearch?: boolean;
  /** Show browse dropdown */
  showBrowse?: boolean;
  /** Browse dropdown actions */
  browseActions?: FroxDropdownAction[];
  /** Notification icons */
  notifications?: FroxNotificationProps[];
  /** Profile dropdown actions */
  profileActions?: FroxDropdownAction[];
  /** Profile avatar */
  profileAvatar?: React.ReactNode;
  /** Mobile menu toggle callback (for hamburger menu) */
  onMobileMenuToggle?: () => void;
  /** Show mobile menu button */
  showMobileMenu?: boolean;
  /** Custom className */
  className?: string;
  /** Children (additional header content) */
  children?: React.ReactNode;
}

// ============================================================================
// Main Component
// ============================================================================

export const FroxHeader = React.forwardRef<HTMLElement, FroxHeaderProps>(
  (
    {
      logo,
      showLogo = false,
      searchPlaceholder = "Search",
      searchValue,
      onSearchChange,
      showSearch = true,
      showBrowse = false,
      browseActions = [],
      notifications = [],
      profileActions = [],
      profileAvatar,
      onMobileMenuToggle,
      showMobileMenu = true,
      className,
      children,
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={cn(
          "flex items-center justify-between flex-wrap bg-neutral-bg p-5 gap-3 md:gap-5 md:py-6 md:pl-[25px] md:pr-[38px] lg:flex-nowrap dark:bg-dark-neutral-bg lg:gap-0",
          className
        )}
      >
        {/* Mobile Menu Toggle (Hamburger) */}
        {showMobileMenu && onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2.5 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-dark-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center order-0"
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-6 w-6 text-gray-500 dark:text-gray-dark-500" />
          </button>
        )}

        {/* Logo (hidden by default when sidebar is present) */}
        {showLogo && logo && (
          <div className="hidden logo">
            {logo}
          </div>
        )}

        {/* Search Bar */}
        {showSearch && (
          <div className="bg-gray-100 flex rounded-xl w-full m-0 py-[14px] px-[18px] xl:w-[360px] dark:bg-gray-dark-100 lg:max-w-[250px] xl:max-w-[360px] lg:mr-[47px] lg:ml-6 order-2 lg:order-first basis-full lg:basis-auto">
            <Search className="h-5 w-5 text-gray-300 dark:text-gray-dark-300 shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="input w-full bg-transparent outline-none pl-2 h-5 text-gray-900 focus:!outline-none placeholder:text-gray-300 dark:text-gray-dark-900 dark:placeholder:text-gray-dark-300 placeholder:font-semibold"
              placeholder={searchPlaceholder}
            />
            <button type="button" className="shrink-0">
              <Mic className="h-5 w-5 text-gray-300 dark:text-gray-dark-300" />
            </button>
          </div>
        )}

        {/* Browse Dropdown */}
        {showBrowse && browseActions.length > 0 && (
          <div className="hidden lg:block">
            <FroxBrowseDropdown actions={browseActions} />
          </div>
        )}

        {/* Notification Icons & Profile */}
        <div className="flex items-center order-1 user-noti gap-4 md:gap-[30px] xl:gap-[48px] lg:order-3 lg:mr-0">
          {/* Notifications */}
          {notifications.map((notification, index) => (
            <FroxNotificationIcon key={index} {...notification} />
          ))}

          {/* Profile Dropdown */}
          {(profileAvatar || profileActions.length > 0) && (
            <FroxProfileDropdown
              avatar={profileAvatar}
              actions={profileActions}
            />
          )}
        </div>

        {/* Additional Content */}
        {children}
      </header>
    );
  }
);

FroxHeader.displayName = "FroxHeader";

// ============================================================================
// Notification Icon Component
// ============================================================================

const FroxNotificationIcon: React.FC<FroxNotificationProps> = ({
  count,
  color = "fuchsia",
  icon: Icon,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-[26px] h-[26px] cursor-pointer hover:opacity-75 transition-opacity"
    >
      <Icon className="w-full h-full object-cover text-gray-500 dark:text-gray-dark-500" />
      {count !== undefined && count > 0 && (
        <div
          className={cn(
            "w-2 h-2 rounded-full absolute right-[1px] top-[-1px]",
            color === "fuchsia" && "bg-fuchsia",
            color === "red" && "bg-red",
            color === "blue" && "bg-blue",
            color === "green" && "bg-green",
            color === "yellow" && "bg-yellow"
          )}
        />
      )}
    </button>
  );
};

// ============================================================================
// Browse Dropdown Component
// ============================================================================

interface FroxBrowseDropdownProps {
  actions: FroxDropdownAction[];
}

const FroxBrowseDropdown: React.FC<FroxBrowseDropdownProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="dropdown relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center justify-between w-[142px]"
      >
        <div className="items-center justify-center hidden rounded-lg border border-neutral dark:border-dark-neutral-border gap-x-[10px] px-[18px] py-[11px] sm:flex hover:bg-gray-50 dark:hover:bg-gray-dark-100 transition-colors">
          <div className="flex items-center gap-[11px]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-normal font-semibold text-gray-500 dark:text-gray-dark-500">
              Browse
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-dark-500" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <button
            type="button"
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-label="Close dropdown"
          />

          {/* Dropdown Content */}
          <div className="dropdown-content absolute z-20">
            <div className="relative menu rounded-box dropdown-shadow min-w-[237px] mt-[25px] md:mt-[48px] p-[25px] pb-[10px] bg-color-brands">
              {/* Arrow Pointer */}
              <div className="border-solid border-b-8 border-x-transparent border-x-8 border-t-0 absolute w-[14px] top-[-7px] border-b-color-brands" />

              {/* Menu Items */}
              <ul>
                {actions.map((action) => (
                  <li key={action.id} className="text-normal p-[15px] pl-[21px]">
                    <button
                      type="button"
                      onClick={() => {
                        action.onClick?.();
                        setIsOpen(false);
                      }}
                      className="flex items-center bg-transparent p-0 gap-[7px] w-full text-left hover:opacity-80 transition-opacity"
                    >
                      {action.icon && (
                        <action.icon className="w-4 h-4 text-white" />
                      )}
                      {action.iconSrc && (
                        <img src={action.iconSrc} alt="" className="w-4 h-4" />
                      )}
                      <span className="text-white">{action.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// Profile Dropdown Component
// ============================================================================

interface FroxProfileDropdownProps {
  avatar?: React.ReactNode;
  actions: FroxDropdownAction[];
}

const FroxProfileDropdown: React.FC<FroxProfileDropdownProps> = ({
  avatar,
  actions,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="dropdown dropdown-end relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {avatar || (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-dark-200" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && actions.length > 0 && (
        <>
          {/* Overlay */}
          <button
            type="button"
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-label="Close dropdown"
          />

          {/* Dropdown Content */}
          <div className="dropdown-content absolute right-0 z-20">
            <div className="relative menu rounded-box dropdown-shadow p-[25px] pb-[10px] bg-neutral-bg mt-[25px] md:mt-[40px] min-w-[237px] dark:text-gray-dark-500 dark:border-dark-neutral-border dark:bg-dark-neutral-bg">
              {/* Arrow Pointer */}
              <div className="border-solid border-b-8 border-x-transparent border-x-8 border-t-0 absolute w-[14px] top-[-7px] border-b-neutral-bg dark:border-b-dark-neutral-bg right-[18px]" />

              {/* Menu Items */}
              <ul>
                {actions.map((action, index) => (
                  <React.Fragment key={action.id}>
                    <li className="text-gray-500 hover:text-gray-1100 hover:bg-gray-100 dark:text-gray-dark-500 dark:hover:text-gray-dark-1100 dark:hover:bg-gray-dark-100 rounded-lg group p-[15px] pl-[21px]">
                      <button
                        type="button"
                        onClick={() => {
                          action.onClick?.();
                          setIsOpen(false);
                        }}
                        className="flex items-center bg-transparent p-0 gap-[7px] w-full text-left"
                      >
                        {action.icon && (
                          <action.icon className="w-4 h-4 group-hover:text-gray-1100 dark:group-hover:text-gray-dark-1100" />
                        )}
                        {action.iconSrc && (
                          <img
                            src={action.iconSrc}
                            alt=""
                            className="w-4 h-4 group-hover:filter-black dark:group-hover:filter-white"
                          />
                        )}
                        <span>{action.label}</span>
                      </button>
                    </li>
                    {/* Optional separator before last item (logout) */}
                    {index === actions.length - 2 && (
                      <div className="w-full bg-neutral h-[1px] my-[7px] dark:bg-dark-neutral-border" />
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
