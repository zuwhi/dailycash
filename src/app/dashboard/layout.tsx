"use client";

import { Sidebar } from "./components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-64">
        <div className="container mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
