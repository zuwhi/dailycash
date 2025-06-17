"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header>
      <nav
        className={`fixed z-50 w-full transition-all duration-300 ${
          scrolled ? "bg-white/95 shadow-lg backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Daily Cash Book
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden items-center space-x-8 md:flex">
              <a
                href="#home"
                className="font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Home
              </a>
              <a
                href="#features"
                className="font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Fitur
              </a>
              <a
                href="#pricing"
                className="font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Kontak
              </a>
              <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="p-2 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="border-t border-gray-200 bg-white md:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3">
                <a
                  href="#home"
                  className="block px-3 py-2 text-gray-700 transition-colors hover:text-blue-600"
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="block px-3 py-2 text-gray-700 transition-colors hover:text-blue-600"
                >
                  Fitur
                </a>
                <a
                  href="#pricing"
                  className="block px-3 py-2 text-gray-700 transition-colors hover:text-blue-600"
                >
                  Pricing
                </a>
                <a
                  href="#contact"
                  className="block px-3 py-2 text-gray-700 transition-colors hover:text-blue-600"
                >
                  Kontak
                </a>
                <button className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-2 text-left text-white">
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
