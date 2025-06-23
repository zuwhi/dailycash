"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  databases,
  DATABASE_ID,
  COLLECTION_TRANSACTION_ID,
} from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Image from "next/image";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Tag,
  DollarSign,
  FileText,
} from "lucide-react";

// Disable static generation for this page
export const dynamic = "force-dynamic";

interface Transaction {
  $id: string;
  date: string;
  datetime: string;
  type: number;
  title: string;
  desc: string;
  amount: number;
  category: {
    id: string;
    name: string;
  };
  image: string;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getImageUrl = (fileId: string) => {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
  };

  const formatDate = (dateString: string, formatString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Tanggal tidak valid";
      }
      return format(date, formatString);
    } catch (error) {
      return "Tanggal tidak valid";
    }
  };

  const fetchTransaction = async () => {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_TRANSACTION_ID,
        params.id as string,
      );
      setTransaction({
        $id: response.$id,
        date: response.date,
        datetime: response.datetime,
        type: response.type,
        title: response.title,
        desc: response.desc,
        amount: response.amount,
        category: response.category,
        image: response.image,
      });
    } catch (error) {
      console.error("Error fetching transaction:", error);
      setError("Transaksi tidak ditemukan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_TRANSACTION_ID,
          params.id as string,
        );
        router.push("/dashboard/cash");
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Gagal menghapus transaksi");
      }
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchTransaction();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Memuat detail transaksi...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            Transaksi Tidak Ditemukan
          </h2>
          <p className="mb-6 text-gray-600">
            Transaksi yang Anda cari tidak ada atau telah dihapus.
          </p>
          <Button onClick={() => router.push("/dashboard/cash")}>
            Kembali ke Daftar Transaksi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/cash")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/cash?edit=${transaction.$id}`)
              }
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              transaction.type === 1
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {transaction.type === 1 ? "Kredit" : "Debet"}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {transaction.title}
          </h1>
        </div>

        <p className="text-xl text-gray-600">
          {transaction.desc || "Tidak ada deskripsi"}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Dibuat pada: {formatDate(transaction.datetime, "dd MMMM yyyy, HH:mm")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Detail Information */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Informasi Keuangan
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <span className="text-gray-600">Jumlah</span>
                <span
                  className={`text-2xl font-bold ${
                    transaction.type === 1 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Rp {transaction.amount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <span className="text-gray-600">Tipe Transaksi</span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    transaction.type === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.type === 1 ? "Kredit" : "Debet"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <span className="text-gray-600">Kategori</span>
                <span className="font-medium text-gray-900">
                  {transaction.category?.name || "Uncategorized"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Calendar className="h-5 w-5 text-blue-600" />
              Informasi Tanggal
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <span className="text-gray-600">Tanggal Transaksi</span>
                <span className="font-medium text-gray-900">
                  {formatDate(transaction.date, "dd MMMM yyyy")}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">Waktu Dibuat</span>
                <span className="font-medium text-gray-900">
                  {formatDate(transaction.datetime, "dd MMM yyyy, HH:mm")}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <FileText className="h-5 w-5 text-blue-600" />
              Deskripsi
            </h2>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="leading-relaxed text-gray-700">
                {transaction.desc || "Tidak ada deskripsi"}
              </p>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Tag className="h-5 w-5 text-blue-600" />
              Gambar Transaksi
            </h2>

            {transaction.image ? (
              <div className="relative">
                <Image
                  src={getImageUrl(transaction.image)}
                  alt={transaction.title}
                  width={400}
                  height={400}
                  className="h-80 w-full rounded-lg object-cover shadow-md"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden",
                    );
                  }}
                />
                <div className="absolute inset-0 flex hidden items-center justify-center rounded-lg bg-gray-100">
                  <div className="text-center text-gray-500">
                    <div className="mb-2 text-4xl">📷</div>
                    <p>Gambar tidak dapat ditampilkan</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100">
                <div className="text-center text-gray-500">
                  <div className="mb-4 text-6xl">📷</div>
                  <p className="text-lg">Tidak ada gambar</p>
                  <p className="text-sm">Transaksi ini tidak memiliki gambar</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Aksi Cepat
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() =>
                  router.push(`/dashboard/cash?edit=${transaction.$id}`)
                }
                className="w-full"
              >
                Edit Transaksi
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/cash")}
                className="w-full"
              >
                Lihat Semua
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
