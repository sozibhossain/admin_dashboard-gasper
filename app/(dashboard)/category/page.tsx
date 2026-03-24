"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addCategory, deleteCategory, getCategories } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import { toErrorMessage } from "@/lib/utils";

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
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
      setName("");
      setParent("none");
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const categories = useMemo(() => data?.data ?? [], [data]);

  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * PAGINATION_LIMIT;
    return categories.slice(start, start + PAGINATION_LIMIT);
  }, [categories, page]);

  const totalPages = Math.max(Math.ceil(categories.length / PAGINATION_LIMIT), 1);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = new FormData();
    payload.append("name", name);
    if (parent !== "none") {
      payload.append("parent", parent);
    }
    if (imageFile) {
      payload.append("image", imageFile);
    }

    createMutation.mutate(payload);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageFile(event.target.files?.[0] || null);
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Category" description="Manage your store inventory" />

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
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
            <Label>Child Category Name</Label>
            <div className="flex items-center gap-2">
              <Select value={parent} onValueChange={setParent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent</SelectItem>
                  {categories.map((category) => (
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
        </div>

        <div className="space-y-2">
          <Label>Photo</Label>
          <label className="flex min-h-[176px] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-[#c7ced9] bg-white p-4 text-center">
            <UploadCloud className="h-8 w-8 text-[#1f73e8]" />
            <p className="mt-3 text-[#5a6370]">
              {imageFile ? imageFile.name : "Drag and drop image here, or click add image"}
            </p>
            <span className="mt-3 inline-flex h-9 items-center rounded-sm bg-[#1f73e8] px-4 text-[16px] text-white">Add Image</span>
            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
          </label>
        </div>

        <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
          <Button type="button" variant="destructive" onClick={() => setName("")}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Confirming..." : "Confirm"}
          </Button>
        </div>
      </form>

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
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(category._id)}>
                        <Trash2 className="h-5 w-5 text-[#ef3030]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">Showing {(page - 1) * PAGINATION_LIMIT + 1} to {Math.min(page * PAGINATION_LIMIT, categories.length)} in first entries</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

