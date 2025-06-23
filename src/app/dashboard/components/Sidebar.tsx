"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  Apple,
  BarChart3,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/auth";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Cash",
    href: "/dashboard/cash",
    icon: Wallet,
  },
  {
    title: "Category",
    href: "/dashboard/category",
    icon: Apple,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Redirect to login page after logout
      window.location.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          // Base styles
          "z-40 h-screen bg-white/80 backdrop-blur-md",
          // Mobile styles: fixed position, full height, slide animation
          "fixed top-0 left-0 h-full w-64 -translate-x-full transition-transform duration-200 ease-in-out",
          // Desktop styles: static position, border
          "md:static md:translate-x-0 md:border-r md:border-gray-200",
          // Show on mobile when open
          isOpen && "translate-x-0",
        )}
      >
        <div className="mt-4 flex h-screen flex-col p-6 md:mt-0">
          <div className="mt-4 mb-8 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight text-blue-700">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#3b82f6" />
                <path
                  d="M8 12l2 2 4-4"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              DailyCash
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-5 py-3 text-base font-medium transition-all",
                    active
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-blue-100 hover:text-blue-700",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? "text-blue-500" : "text-gray-400",
                    )}
                  />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="mt-auto border-t border-gray-200 pt-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full justify-start gap-3 px-5 py-3 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
