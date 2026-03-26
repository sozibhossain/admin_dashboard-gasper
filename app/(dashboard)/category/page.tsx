"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addCategory, deleteCategory, getCategories, updateCategory } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import type { Category } from "@/types/api";
import { toErrorMessage } from "@/lib/utils";

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [parent, setParent] = useState<string>("none");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ includeProducts: true }),
  });

  const createMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category created");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeFormModal();
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) => updateCategory(id, payload),
    onSuccess: (response) => {
      toast.success(response.message || "Category updated");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeFormModal();
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteTarget(null);
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const categories = useMemo(() => data?.data ?? [], [data]);

  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * PAGINATION_LIMIT;
    return categories.slice(start, start + PAGINATION_LIMIT);
  }, [categories, page]);

  const totalPages = Math.max(Math.ceil(categories.length / PAGINATION_LIMIT), 1);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setName("");
    setParent("none");
    setImageFile(null);
  };

  const closeFormModal = () => {
    setFormOpen(false);
    setEditingCategory(null);
    resetForm();
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    resetForm();
    setFormOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setParent(category.parent?._id || "none");
    setImageFile(null);
    setFormOpen(true);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }

    const payload = new FormData();
    payload.append("name", trimmedName);
    if (parent !== "none") {
      payload.append("parent", parent);
    }
    if (imageFile) {
      payload.append("image", imageFile);
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageFile(event.target.files?.[0] || null);
  };

  const handleFormOpenChange = (open: boolean) => {
    if (open) {
      setFormOpen(true);
      return;
    }
    closeFormModal();
  };

  const showingFrom = categories.length === 0 ? 0 : (page - 1) * PAGINATION_LIMIT + 1;
  const showingTo = categories.length === 0 ? 0 : Math.min(page * PAGINATION_LIMIT, categories.length);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Category"
        description="Manage your store inventory"
        action={
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton columns={5} rows={6} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-sm bg-[#eef2f8]">
                      {category.image?.url ? <Image src={category.image.url} alt={category.name} fill className="object-cover" /> : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.parent?.name || "-"}</TableCell>
                  <TableCell>{category.productCount || 0}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(category)}>
                        <Pencil className="h-4 w-4 text-[#1f73e8]" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(category)}>
                        <Trash2 className="h-5 w-5 text-[#ef3030]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">Showing {showingFrom} to {showingTo} in first entries</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <Dialog open={formOpen} onOpenChange={handleFormOpenChange}>
        <DialogContent className="max-w-[620px]">
          <DialogHeader>
            <DialogTitle className="text-center">{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription className="text-center">
              {editingCategory ? "Update category information" : "Create a new category for your store"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="Type category name here..."
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Parent Category</Label>
              <div className="flex items-center gap-2">
                <Select value={parent} onValueChange={setParent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent</SelectItem>
                    {categories
                      .filter((category) => category._id !== editingCategory?._id)
                      .map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button type="button" size="icon" variant="outline" onClick={() => setParent("none")}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Photo</Label>
              <label className="flex min-h-[176px] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-[#c7ced9] bg-white p-4 text-center">
                <UploadCloud className="h-8 w-8 text-[#1f73e8]" />
                <p className="mt-3 text-[#5a6370]">
                  {imageFile
                    ? imageFile.name
                    : editingCategory?.image?.url
                      ? "Current image will be kept unless you upload a new one"
                      : "Drag and drop image here, or click add image"}
                </p>
                <span className="mt-3 inline-flex h-9 items-center rounded-sm bg-[#1f73e8] px-4 text-[16px] text-white">Add Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
              </label>
            </div>

            <DialogFooter className="sm:grid sm:grid-cols-2 sm:gap-3">
              <Button type="button" variant="outline" className="w-full" onClick={closeFormModal}>
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (editingCategory ? "Updating..." : "Creating...") : editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-center !text-[#e10000]">Are You Sure To Delete this Category?</DialogTitle>
            <DialogDescription className="text-center">This action cannot be undone.</DialogDescription>
          </DialogHeader>

          {deleteTarget ? (
            <div className="space-y-3 border-y border-[#e2e8f0] py-4 text-[16px]">
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Category Name</span>
                <span className="font-medium text-[#1f73e8]">{deleteTarget.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Parent</span>
                <span>{deleteTarget.parent?.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Products</span>
                <span>{deleteTarget.productCount || 0}</span>
              </div>
            </div>
          ) : null}

          <DialogFooter className="sm:grid sm:grid-cols-2 sm:gap-3">
            <Button className="w-full" variant="outline" onClick={() => setDeleteTarget(null)}>
              No
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

