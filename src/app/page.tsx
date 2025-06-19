"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    console.log(
      "APPWRITE ENDPOINT:",
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    );
    console.log("Project ID:", process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to DailyCash</h1>
        <p className="mb-8 text-lg text-gray-600">
          Manage your daily expenses and income with ease
        </p>
        <Link href="/dashboard">
          <Button size="lg">Get Starlllted</Button>
        </Link>
      </div>
    </div>
  );
}
