import React from "react";
import {
  ArrowRight,
  BookOpen,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  Users,
} from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

const DaisyCashLanding = () => {
  const checkAuthAndRedirect = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        window.location.replace("/dashboard");
      } else {
        window.location.replace("/auth/login");
      }
    } catch (error) {
      window.location.replace("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-blue-100 bg-white shadow-sm">
        <div className="max-w-8xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DaisyCash</span>
            </div>
            <div className="hidden items-center space-x-8 md:flex">
              <button
                onClick={checkAuthAndRedirect}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl leading-tight font-bold text-gray-900 lg:text-6xl">
                  Daisy<span className="text-blue-600">Cash</span>
                </h1>
                <p className="max-w-lg text-xl leading-relaxed text-gray-600">
                  Catat setiap pemasukan dan pengeluaran harian dengan mudah dan
                  cepat.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={checkAuthAndRedirect}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
                >
                  Mulai Sekarang
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>100% Aman</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Gratis Selamanya</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>10K+ Pengguna</span>
                </div>
              </div>
            </div>

            {/* Right Column - Digital Cash Book Illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Main Book Container */}
                <div className="relative h-96 w-80 transform animate-pulse transition-all duration-500 hover:scale-105">
                  {/* Book Cover */}
                  <div className="absolute inset-0 rotate-3 transform rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl transition-transform duration-500 hover:rotate-6">
                    <div className="absolute inset-4 rounded-xl bg-white shadow-inner">
                      <div className="flex h-full flex-col p-6">
                        <div className="mb-6 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              Kas Harian
                            </h3>
                            <p className="text-xs text-gray-500">Juni 2025</p>
                          </div>
                        </div>

                        {/* Cash Flow Items */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm text-gray-700">
                                Penjualan
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-green-600">
                              +500K
                            </span>
                          </div>

                          <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                              <span className="text-sm text-gray-700">
                                Belanja
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-red-600">
                              -150K
                            </span>
                          </div>

                          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <span className="text-sm text-gray-700">
                                Investasi
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-blue-600">
                              -100K
                            </span>
                          </div>
                        </div>

                        {/* Total Balance */}
                        <div className="mt-4 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">
                              Saldo Hari Ini
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              +250K
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-green-500 shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>

                <div className="absolute -bottom-4 -left-4 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-blue-500 shadow-lg delay-200">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>

                {/* Background Decorative Elements */}
                <div className="absolute top-8 right-8 -z-10 h-32 w-32 animate-pulse rounded-full bg-blue-100 opacity-20"></div>
                <div className="absolute bottom-8 left-8 -z-10 h-24 w-24 animate-pulse rounded-full bg-green-100 opacity-20 delay-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Kenapa Pilih DaisyCash?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Solusi terbaik untuk mengelola keuangan harian Anda dengan mudah
              dan efisien
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 transition-transform group-hover:scale-110">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Pencatatan Mudah
              </h3>
              <p className="text-gray-600">
                Catat pemasukan dan pengeluaran hanya dalam hitungan detik
                dengan interface yang intuitif
              </p>
            </div>

            <div className="group rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 transition-transform group-hover:scale-110">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Laporan Otomatis
              </h3>
              <p className="text-gray-600">
                Dapatkan laporan keuangan harian, mingguan, dan bulanan secara
                otomatis
              </p>
            </div>

            <div className="group rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 transition-transform group-hover:scale-110">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Aman & Terpercaya
              </h3>
              <p className="text-gray-600">
                Data keuangan Anda dilindungi dengan enkripsi tingkat bank dan
                backup otomatis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white">
            Siap Mulai Mengelola Keuangan Anda?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Bergabunglah dengan ribuan pengguna yang sudah merasakan kemudahan
            mengelola kas harian dengan DaisyCash
          </p>
          <button className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-lg">
            Mulai Gratis Sekarang
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">DaisyCash</span>
              </div>
              <p className="text-gray-400">
                Solusi terbaik untuk pencatatan kas harian Anda
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Produk</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Fitur
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Harga
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Demo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Dukungan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Bantuan
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Kontak
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Tentang
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Karir
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DaisyCash. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DaisyCashLanding;
