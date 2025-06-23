"use client";

import React, { useEffect, useState } from "react";
import {
  databases,
  storage,
  DATABASE_ID,
  COLLECTION_TRANSACTION_ID,
  COLLECTION_CATEGORY_ID,
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
  DialogFooter,
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
import { useRouter, useSearchParams } from "next/navigation";

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

interface Category {
  $id: string;
  name: string;
  type: number;
}

export default function TransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [filterType, setFilterType] = useState("all");
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

  const fetchCategories = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_CATEGORY_ID,
      );
      setCategories(
        response.documents.map((doc) => ({
          $id: doc.$id,
          name: doc.name,
          type: doc.type,
        })),
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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
    fetchCategories();
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      const transaction = transactions.find((t) => t.$id === editId);
      if (transaction) {
        handleEdit(transaction);
        // Clear the URL parameter
        router.replace("/dashboard/cash");
      }
    }
  }, [searchParams, transactions, router]);

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "none") {
      setFormData({
        ...formData,
        category: {
          id: "",
          name: "Uncategorized",
        },
      });
    } else {
      const selectedCategory = categories.find((cat) => cat.$id === categoryId);
      setFormData({
        ...formData,
        category: {
          id: categoryId,
          name: selectedCategory?.name || "Uncategorized",
        },
      });
    }
  };

  // Reset kategori ketika tipe transaksi berubah
  useEffect(() => {
    if (formData.type) {
      setFormData((prev) => ({
        ...prev,
        category: {
          id: "",
          name: "Uncategorized",
        },
      }));
    }
  }, [formData.type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }

      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar.");
        return;
      }

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
      // Upload file tanpa permission khusus (menggunakan default bucket permissions)
      const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
      console.log("Image uploaded successfully:", response.$id);
      return response.$id;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Gagal mengupload gambar. Silakan coba lagi.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageId = formData.image;

      if (selectedFile) {
        try {
          imageId = await uploadImage(selectedFile);
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          alert(
            "Gagal mengupload gambar. Transaksi akan disimpan tanpa gambar.",
          );
          imageId = ""; // Reset image ID jika upload gagal
        }
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
      // Reset form
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
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Gagal menyimpan transaksi. Silakan coba lagi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
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
    setFormData({
      ...transaction,
      category: {
        id: transaction.category?.id || "",
        name: transaction.category?.name || "Uncategorized",
      },
    });
    if (transaction.image) {
      setImagePreview(getImageUrl(transaction.image));
    } else {
      setImagePreview("");
    }
    setIsDialogOpen(true);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setSelectedFile(null);
    setFormData({ ...formData, image: "" });
  };

  const handleView = (transaction: Transaction) => {
    router.push(`/dashboard/cash/${transaction.$id}`);
  };

  const getImageUrl = (fileId: string) => {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType === "all") return true;
    return transaction.type.toString() === filterType;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-blue-900">
          Kelola Transaksi
        </h1>
        <p className="text-lg text-gray-500">
          Tambah, edit, dan kelola transaksi keuangan Anda
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button onClick={() => setIsDialogOpen(true)}>
            Tambah Transaksi
          </Button>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
            >
              Semua
            </Button>
            <Button
              variant={filterType === "1" ? "default" : "outline"}
              onClick={() => setFilterType("1")}
            >
              Kredit
            </Button>
            <Button
              variant={filterType === "2" ? "default" : "outline"}
              onClick={() => setFilterType("2")}
            >
              Debet
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.$id ? "Edit Transaksi" : "Tambah Transaksi Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipe
                </Label>
                <Select
                  value={formData.type?.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: parseInt(value) })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih tipe transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Kredit</SelectItem>
                    <SelectItem value="2">Debet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Judul
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Masukkan judul transaksi"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="desc" className="text-right">
                  Deskripsi
                </Label>
                <Input
                  id="desc"
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Masukkan deskripsi transaksi"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Jumlah
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                  placeholder="Masukkan jumlah"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Tanggal
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Kategori
                </Label>
                <Select
                  value={formData.category?.id || "none"}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Kategori</SelectItem>
                    {categories
                      .filter(
                        (cat) => cat.type === formData.type || cat.type === 0,
                      )
                      .map((category) => (
                        <SelectItem key={category.$id} value={category.$id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Gambar
                </Label>
                <div className="col-span-3">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="col-span-3"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: JPG, PNG, GIF. Maksimal 5MB.
                  </p>
                </div>
              </div>
              {imagePreview && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Preview</Label>
                  <div className="relative col-span-3">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover"
                      unoptimized
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                {formData.$id ? "Update" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                <TableHead>Gambar</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.$id}>
                  <TableCell>
                    {formatDate(transaction.date, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {transaction.type === 1 ? "Kredit" : "Debet"}
                  </TableCell>
                  <TableCell>{transaction.title}</TableCell>
                  <TableCell>{transaction.desc}</TableCell>
                  <TableCell
                    className={
                      transaction.type === 1
                        ? "font-medium text-green-600"
                        : "font-medium text-red-600"
                    }
                  >
                    Rp {transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const category = categories.find(
                        (cat) => cat.$id === transaction.category?.id,
                      );
                      return (
                        category?.name ||
                        transaction.category?.name ||
                        "Uncategorized"
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {transaction.image && (
                      <Image
                        src={getImageUrl(transaction.image)}
                        alt="Transaction"
                        width={50}
                        height={50}
                        className="rounded object-cover"
                        unoptimized
                        onError={(e) => {
                          // Hide image if it fails to load
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(transaction)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transaction.$id)}
                      >
                        Hapus
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
