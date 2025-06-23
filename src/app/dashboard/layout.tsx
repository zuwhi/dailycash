"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { isAuthenticated } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          // Redirect to login if not authenticated
          window.location.replace("/auth/login");
          return;
        }
        setAuthStatus(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        // Redirect to login on error
        window.location.replace("/auth/login");
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="text-lg">Memuat...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!authStatus) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="flex">
        <Sidebar />
        <main className="mt-0 min-h-screen w-full flex-1 p-4 md:mt-6">
          <div className="mx-auto w-full max-w-6xl pt-10 md:pt-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
