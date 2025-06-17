"use client";

import React, { useEffect, useState } from "react";
import {
  databases,
  DATABASE_ID,
  COLLECTION_TRANSACTION_ID,
  Query,
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
  income: number;
  expense: number;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
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
      const income = fetchedTransactions
        .filter((t) => t.type === 1)
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = fetchedTransactions
        .filter((t) => t.type === 2)
        .reduce((sum, t) => sum + t.amount, 0);

      setTotalIncome(income);
      setTotalExpense(expense);
      setTotalBalance(income - expense);

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
      const monthlyMap = new Map<string, { income: number; expense: number }>();
      fetchedTransactions.forEach((t) => {
        const month = format(new Date(t.date), "MMM yyyy");
        const current = monthlyMap.get(month) ?? { income: 0, expense: 0 };
        if (t.type === 1) {
          current.income += t.amount;
        } else {
          current.expense += t.amount;
        }
        monthlyMap.set(month, current);
      });

      const monthlyData = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month,
          income: data.income,
          expense: data.expense,
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
    fetchTransactions();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Title>Total Balance</Title>
          <Text className="mt-2 text-3xl font-bold">
            Rp {totalBalance.toLocaleString()}
          </Text>
        </Card>
        <Card>
          <Title>Income</Title>
          <Text className="mt-2 text-3xl font-bold text-green-600">
            Rp {totalIncome.toLocaleString()}
          </Text>
        </Card>
        <Card>
          <Title>Expense</Title>
          <Text className="mt-2 text-3xl font-bold text-red-600">
            Rp {totalExpense.toLocaleString()}
          </Text>
        </Card>
        <Card>
          <Title>Transactions</Title>
          <Text className="mt-2 text-3xl font-bold">{transactions.length}</Text>
        </Card>
      </div>

      <TabGroup>
        <TabList className="mt-8">
          <Tab>Overview</Tab>
          <Tab>Categories</Tab>
          <Tab>Monthly</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Income vs Expense (Last 6 Months)</Title>
                <BarChart
                  className="mt-6 h-72"
                  data={monthlySummary}
                  index="month"
                  categories={["income", "expense"]}
                  colors={["green", "red"]}
                  valueFormatter={(number) => `Rp ${number.toLocaleString()}`}
                  yAxisWidth={48}
                />
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Category Distribution</Title>
                <DonutChart
                  className="mt-6 h-72"
                  data={categorySummary}
                  category="amount"
                  index="name"
                  valueFormatter={(number) => `Rp ${number.toLocaleString()}`}
                  colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
                />
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Monthly Trend</Title>
                <LineChart
                  className="mt-6 h-72"
                  data={monthlySummary}
                  index="month"
                  categories={["income", "expense"]}
                  colors={["green", "red"]}
                  valueFormatter={(number) => `Rp ${number.toLocaleString()}`}
                  yAxisWidth={48}
                />
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
