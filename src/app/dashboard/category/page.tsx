"use client";

import React, { useEffect, useState } from "react";
import {
  databases,
  DATABASE_ID,
  COLLECTION_CATEGORY_ID,
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

interface Category {
  $id: string;
  name: string;
  type: number;
  icon: string;
  color: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    type: 1,
    icon: "tag",
    color: "#000000",
  });

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
          icon: doc.icon,
          color: doc.color,
        })),
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: formData.name,
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
      };

      if (formData.$id) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_CATEGORY_ID,
          formData.$id,
          categoryData,
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_CATEGORY_ID,
          ID.unique(),
          categoryData,
        );
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_CATEGORY_ID, id);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleEdit = (category: Category) => {
    setFormData(category);
    setIsDialogOpen(true);
  };

  const iconOptions = [
    { value: "tag", label: "Tag" },
    { value: "shopping-cart", label: "Shopping Cart" },
    { value: "home", label: "Home" },
    { value: "car", label: "Car" },
    { value: "utensils", label: "Food" },
    { value: "graduation-cap", label: "Education" },
    { value: "heart", label: "Health" },
    { value: "plane", label: "Travel" },
    { value: "gift", label: "Gift" },
    { value: "coffee", label: "Coffee" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-blue-900">
          Kelola Kategori
        </h1>
        <p className="text-lg text-gray-500">
          Tambah, edit, dan kelola kategori transaksi Anda
        </p>
      </div>

      {/* <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={() => setIsDialogOpen(true)}>Tambah Kategori</Button>
      </div> */}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="mb-4"
            onClick={() => {
              setFormData({
                name: "",
                type: 1,
                icon: "tag",
                color: "#000000",
              });
            }}
          >
            Tambah Kategori Baru
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.$id ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                placeholder="Masukkan nama kategori"
              />
            </div>
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
                  <SelectValue placeholder="Pilih tipe kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Kredit</SelectItem>
                  <SelectItem value="2">Debet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="col-span-3"
                placeholder="Masukkan nama icon"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Warna
              </Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="col-span-3"
              />
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
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Warna</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.$id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    {category.type === 1 ? "Kredit" : "Debet"}
                  </TableCell>
                  <TableCell>
                    <i className={`fas fa-${category.icon}`}></i>
                  </TableCell>
                  <TableCell>
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.$id)}
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
