"use client";
"use server";

import React, { useEffect, useState } from "react";
import {
  databases,
  storage,
  DATABASE_ID,
  COLLECTION_TRANSACTION_ID,
  BUCKET_ID,
  Query,
} from "@/lib/appwrite";
import { ID } from "appwrite";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import Image from "next/image";

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

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 1,
    date: format(new Date(), "yyyy-MM-dd"),
    datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    title: "",
    desc: "",
    amount: 0,
    category: {
      id: "",
      name: "Uncategorized",
    },
    image: "",
  });

  const fetchTransactions = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_TRANSACTION_ID,
      );
      setTransactions(
        response.documents.map((doc) => ({
          $id: doc.$id,
          date: doc.date,
          datetime: doc.datetime,
          type: doc.type,
          title: doc.title,
          desc: doc.desc,
          amount: doc.amount,
          category: doc.category,
          image: doc.image,
        })),
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const response = await storage.createFile(BUCKET_ID, ID.unique(), file, [
        "read('any')",
      ]);
      return response.$id;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageId = formData.image;

      if (selectedFile) {
        imageId = await uploadImage(selectedFile);
      }

      const transactionData = {
        type: formData.type,
        title: formData.title,
        desc: formData.desc,
        amount: formData.amount,
        category: {
          name: formData.category?.name || "Uncategorized",
        },
        image: imageId,
        date: new Date(),
        updated_at: new Date().toISOString(),
      };

      console.log(transactionData);

      if (formData.$id) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_TRANSACTION_ID,
          formData.$id,
          transactionData,
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_TRANSACTION_ID,
          ID.unique(),
          transactionData,
        );
      }
      setIsDialogOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_TRANSACTION_ID,
          id,
        );
        fetchTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData(transaction);
    setImagePreview(transaction.image);
    setIsDialogOpen(true);
  };

  const getImageUrl = (fileId: string) => {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transaction Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({
                  type: 1,
                  date: format(new Date(), "yyyy-MM-dd"),
                  datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                  title: "",
                  desc: "",
                  amount: 0,
                  category: {
                    id: "",
                    name: "Uncategorized",
                  },
                  image: "",
                });
                setImagePreview("");
                setSelectedFile(null);
              }}
            >
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {formData.$id ? "Edit Transaction" : "Add Transaction"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type?.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Income</SelectItem>
                      <SelectItem value="2">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category?.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: { ...formData.category!, name: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">
                {formData.$id ? "Update" : "Create"} Transaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.$id}>
                  <TableCell>
                    {transaction.date
                      ? format(new Date(transaction.date), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {transaction.type === 1 ? "Income" : "Expense"}
                  </TableCell>
                  <TableCell>{transaction.title}</TableCell>
                  <TableCell>{transaction.desc}</TableCell>
                  <TableCell
                    className={
                      transaction.type === 1 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {transaction.type === 1 ? "+" : "-"} Rp {transaction.amount}
                  </TableCell>
                  <TableCell>
                    {transaction.category?.name ?? "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    {transaction.image && (
                      <Image
                        src={getImageUrl(transaction.image)}
                        alt={transaction.title}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(transaction.$id)}
                      >
                        Delete
                      </Button>
                    </div>
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
