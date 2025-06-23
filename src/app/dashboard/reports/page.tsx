"use client";

import React, { useEffect, useState } from "react";
import {
  databases,
  DATABASE_ID,
  COLLECTION_TRANSACTION_ID,
  Query,
  ID,
} from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, parse } from "date-fns";
import * as XLSX from "xlsx";
import { toast } from "sonner";

// Disable static generation for this page
export const dynamic = "force-dynamic";

interface Transaction {
  $id: string;
  date: string;
  type: number;
  title: string;
  desc: string;
  amount: number;
  category: {
    name: string;
  };
}

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MM"));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), "yyyy"));

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  ).map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  const fetchTransactions = async () => {
    try {
      const startDate = startOfMonth(
        new Date(`${selectedYear}-${selectedMonth}-01`),
      );
      const endDate = endOfMonth(startDate);

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_TRANSACTION_ID,
        [
          Query.greaterThanEqual("date", startDate.toISOString()),
          Query.lessThanEqual("date", endDate.toISOString()),
        ],
      );

      setTransactions(
        response.documents.map((doc) => ({
          $id: doc.$id,
          date: doc.date,
          type: doc.type,
          title: doc.title,
          desc: doc.desc,
          amount: doc.amount,
          category: doc.category,
        })),
      );
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, selectedYear]);

  const exportToExcel = () => {
    const data = transactions.map((transaction) => ({
      ID: transaction.$id,
      Date: format(new Date(transaction.date), "yyyy-MM-dd"),
      Type: transaction.type === 1 ? "Kredit" : "Debet",
      Title: transaction.title,
      Description: transaction.desc,
      Amount: transaction.amount,
      Category: transaction.category?.name ?? "Uncategorized",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    const metadata = [
      { Key: "Version", Value: "1.0" },
      { Key: "ExportDate", Value: format(new Date(), "yyyy-MM-dd HH:mm:ss") },
      { Key: "TotalRecords", Value: transactions.length.toString() },
    ];
    const metadataWs = XLSX.utils.json_to_sheet(metadata);
    XLSX.utils.book_append_sheet(wb, metadataWs, "Metadata");

    const fileName = `transactions_${selectedMonth}_${selectedYear}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const importFromExcel = async (file: File): Promise<ImportResult> => {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      // Validate metadata
      const metadataSheet = workbook.Sheets["Metadata"];
      if (!metadataSheet) {
        throw new Error("Invalid file format: Metadata sheet not found");
      }

      const transactionsSheet = workbook.Sheets["Transactions"];
      if (!transactionsSheet) {
        throw new Error("Invalid file format: Transactions sheet not found");
      }

      const rows = XLSX.utils.sheet_to_json(transactionsSheet);

      for (const row of rows) {
        try {
          const transaction = row as any;

          // Validate required fields
          if (
            !transaction.Date ||
            !transaction.Type ||
            !transaction.Title ||
            !transaction.Amount
          ) {
            result.failed++;
            result.errors.push(
              `Row ${result.success + result.failed + result.skipped + 1}: Missing required fields`,
            );
            continue;
          }

          // Check for existing transaction
          if (transaction.ID) {
            const existingDoc = await databases.getDocument(
              DATABASE_ID,
              COLLECTION_TRANSACTION_ID,
              transaction.ID,
            );
            if (existingDoc) {
              result.skipped++;
              continue;
            }
          }

          // Prepare transaction data
          const transactionData = {
            date: new Date(transaction.Date),
            type: transaction.Type === "Kredit" ? 1 : 2,
            title: transaction.Title,
            desc: transaction.Description || "",
            amount: Number(transaction.Amount),
            category: {
              name: transaction.Category || "Uncategorized",
            },
          };

          // Create new transaction
          await databases.createDocument(
            DATABASE_ID,
            COLLECTION_TRANSACTION_ID,
            ID.unique(),
            transactionData,
          );

          result.success++;
        } catch (error: any) {
          result.failed++;
          result.errors.push(
            `Row ${result.success + result.failed + result.skipped + 1}: ${error.message}`,
          );
        }
      }

      return result;
    } catch (error: any) {
      throw new Error(`Import failed: ${error.message}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importFromExcel(file);

      if (result.success > 0) {
        toast.success(`Successfully imported ${result.success} transactions`);
      }
      if (result.skipped > 0) {
        toast.info(`Skipped ${result.skipped} existing transactions`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} transactions`);
        console.error("Import errors:", result.errors);
      }

      // Refresh transactions list
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const totalKredit = transactions
    .filter((t) => t.type === 1)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebet = transactions
    .filter((t) => t.type === 2)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-blue-900">
          Laporan Keuangan
        </h1>
        <p className="text-lg text-gray-500">
          Analisis dan laporan keuangan Anda
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button onClick={exportToExcel}>Export ke Excel</Button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-upload"
              disabled={isImporting}
            />
            <Button
              onClick={() => document.getElementById("excel-upload")?.click()}
              disabled={isImporting}
            >
              {isImporting ? "Mengimpor..." : "Import dari Excel"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Kredit</h3>
          <p className="mt-2 text-2xl font-bold text-green-600">
            Rp {totalKredit.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Debet</h3>
          <p className="mt-2 text-2xl font-bold text-red-600">
            Rp {totalDebet.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Saldo</h3>
          <p
            className={`mt-2 text-2xl font-bold ${
              totalKredit - totalDebet >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            Rp {(totalKredit - totalDebet).toLocaleString()}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div>Memuat...</div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Kategori</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.$id}>
                  <TableCell>
                    {format(new Date(transaction.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {transaction.type === 1 ? "Kredit" : "Debet"}
                  </TableCell>
                  <TableCell>{transaction.title}</TableCell>
                  <TableCell>{transaction.desc}</TableCell>
                  <TableCell
                    className={
                      transaction.type === 1 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {transaction.type === 1 ? "+" : "-"} Rp{" "}
                    {transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {transaction.category?.name ?? "Uncategorized"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
