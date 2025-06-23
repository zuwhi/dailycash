"use client";

import React, { useEffect, useState } from "react";
import {
  databases,
  DATABASE_ID,
  COLLECTION_TRANSACTION_ID,
  Query,
  account,
} from "@/lib/appwrite";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanels,
  TabPanel,
  BarChart,
  DonutChart,
  LineChart,
} from "@tremor/react";
import { useRouter } from "next/navigation";

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

interface CategorySummary {
  name: string;
  amount: number;
}

interface MonthlySummary {
  month: string;
  kredit: number;
  debet: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalKredit, setTotalKredit] = useState(0);
  const [totalDebet, setTotalDebet] = useState(0);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);

  const fetchTransactions = async () => {
    try {
      const startDate = startOfMonth(subMonths(new Date(), 6));
      const endDate = endOfMonth(new Date());

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_TRANSACTION_ID,
        [
          Query.greaterThanEqual("date", startDate.toISOString()),
          Query.lessThanEqual("date", endDate.toISOString()),
        ],
      );

      const fetchedTransactions = response.documents.map((doc) => ({
        $id: doc.$id,
        date: doc.date,
        type: doc.type,
        title: doc.title,
        desc: doc.desc,
        amount: doc.amount,
        category: doc.category,
      }));

      setTransactions(fetchedTransactions);

      // Calculate totals
      const kredit = fetchedTransactions
        .filter((t) => t.type === 1)
        .reduce((sum, t) => sum + t.amount, 0);
      const debet = fetchedTransactions
        .filter((t) => t.type === 2)
        .reduce((sum, t) => sum + t.amount, 0);

      setTotalKredit(kredit);
      setTotalDebet(debet);
      setTotalBalance(kredit - debet);

      // Calculate category summary
      const categoryMap = new Map<string, number>();
      fetchedTransactions.forEach((t) => {
        const categoryName = t.category?.name ?? "Uncategorized";
        const currentAmount = categoryMap.get(categoryName) ?? 0;
        categoryMap.set(
          categoryName,
          currentAmount + (t.type === 1 ? t.amount : -t.amount),
        );
      });

      const categoryData = Array.from(categoryMap.entries()).map(
        ([name, amount]) => ({
          name,
          amount,
        }),
      );
      setCategorySummary(categoryData);

      // Calculate monthly summary
      const monthlyMap = new Map<string, { kredit: number; debet: number }>();
      fetchedTransactions.forEach((t) => {
        const month = format(new Date(t.date), "MMM yyyy");
        const current = monthlyMap.get(month) ?? { kredit: 0, debet: 0 };
        if (t.type === 1) {
          current.kredit += t.amount;
        } else {
          current.debet += t.amount;
        }
        monthlyMap.set(month, current);
      });

      const monthlyData = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month,
          kredit: data.kredit,
          debet: data.debet,
        }))
        .sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        });

      setMonthlySummary(monthlyData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.getSession("current");
        // Session OK
      } catch {
        router.replace("/auth/login");
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-blue-900">
          Dashboard
        </h1>
        <p className="text-lg text-gray-500">
          Ringkasan keuangan dan aktivitas Anda
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-start rounded-xl border border-blue-100 bg-white/90 p-6 shadow-md">
          <span className="mb-1 text-sm text-gray-400">Saldo Total</span>
          <span className="text-2xl font-bold text-blue-800">
            Rp {totalBalance.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col items-start rounded-xl border border-green-100 bg-white/90 p-6 shadow-md">
          <span className="mb-1 text-sm text-gray-400">Kredit</span>
          <span className="text-2xl font-bold text-green-600">
            Rp {totalKredit.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col items-start rounded-xl border border-red-100 bg-white/90 p-6 shadow-md">
          <span className="mb-1 text-sm text-gray-400">Debet</span>
          <span className="text-2xl font-bold text-red-600">
            Rp {totalDebet.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col items-start rounded-xl border border-gray-100 bg-white/90 p-6 shadow-md">
          <span className="mb-1 text-sm text-gray-400">Transaksi</span>
          <span className="text-2xl font-bold text-gray-700">
            {transactions.length}
          </span>
        </div>
      </div>

      <TabGroup>
        <TabList className="mt-8">
          <Tab>Ringkasan</Tab>
          <Tab>Kategori</Tab>
          <Tab>Bulanan</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Kredit vs Debet (6 Bulan Terakhir)</Title>
                <BarChart
                  className="mt-6 h-72"
                  data={monthlySummary}
                  index="month"
                  categories={["kredit", "debet"]}
                  colors={["green", "red"]}
                  valueFormatter={(number) => `Rp ${number.toLocaleString()}`}
                />
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Ringkasan Kategori</Title>
                <DonutChart
                  className="mt-6 h-72"
                  data={categorySummary}
                  category="amount"
                  index="name"
                  valueFormatter={(number) => `Rp ${number.toLocaleString()}`}
                />
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Tren Kredit vs Debet</Title>
                <LineChart
                  className="mt-6 h-72"
                  data={monthlySummary}
                  index="month"
                  categories={["kredit", "debet"]}
                  colors={["green", "red"]}
                  valueFormatter={(number) => `Rp ${number.toLocaleString()}`}
                />
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
