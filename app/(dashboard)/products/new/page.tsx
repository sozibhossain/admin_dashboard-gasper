"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, getCategories } from "@/lib/api";
import { toErrorMessage } from "@/lib/utils";

type ProductFormState = {
  title: string;
  description: string;
  detailedDescription: string;
  category: string;
  brand: string;
  size: string;
  sku: string;
  price: string;
  stock: string;
  colors: string;
};

const initialFormState: ProductFormState = {
  title: "",
  description: "",
  detailedDescription: "",
  category: "",
  brand: "",
  size: "M",
  sku: "",
  price: "",
  stock: "",
  colors: "",
};

export default function NewProductPage() {
  const [form, setForm] = useState(initialFormState);
  const [files, setFiles] = useState<File[]>([]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "for-product"],
    queryFn: () => getCategories(),
  });

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (response) => {
      toast.success(response.message || "Product created");
      setForm(initialFormState);
      setFiles([]);
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const categories = categoriesData?.data || [];

  const fileLabel = useMemo(() => {
    if (files.length === 0) return "Drag and drop image here, or click add image";
    if (files.length === 1) return files[0].name;
    return `${files.length} images selected`;
  }, [files]);

  const setField = (field: keyof ProductFormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files || []));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = new FormData();

    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("detailedDescription", form.detailedDescription);
    payload.append("category", form.category);
    payload.append("brand", form.brand);
    payload.append("size", form.size);
    payload.append("sku", form.sku);
    payload.append("price", form.price);
    payload.append("stock", form.stock);
    payload.append("colors", form.colors);

    files.forEach((file) => payload.append("photos", file));

    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Add New Product"
        action={
          <Link href="/products" className="text-[#1f73e8]">
            <Button variant="ghost">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to products
            </Button>
          </Link>
        }
      />

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={form.title} onChange={(event) => setField("title", event.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Type Description here"
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Delivery & Return Policy</Label>
            <Textarea
              id="details"
              placeholder="Type Description here"
              value={form.detailedDescription}
              onChange={(event) => setField("detailedDescription", event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Child Category *</Label>
              <Select value={form.category} onValueChange={(value) => setField("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={form.stock}
                onChange={(event) => setField("stock", event.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Regular Price *</Label>
              <Input
                id="price"
                type="number"
                value={form.price}
                onChange={(event) => setField("price", event.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" value={form.sku} onChange={(event) => setField("sku", event.target.value)} required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand">Brands</Label>
              <Input id="brand" placeholder="Select a brand" value={form.brand} onChange={(event) => setField("brand", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Select value={form.size} onValueChange={(value) => setField("size", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colors">Colour *</Label>
            <Input
              id="colors"
              placeholder="Red, Blue, Black"
              value={form.colors}
              onChange={(event) => setField("colors", event.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Photo</Label>
            <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-[#c7ced9] bg-white p-4 text-center">
              <UploadCloud className="h-8 w-8 text-[#1f73e8]" />
              <p className="mt-3 text-[#5a6370]">{fileLabel}</p>
              <span className="mt-3 inline-flex h-9 items-center rounded-sm bg-[#1f73e8] px-4 text-[16px] text-white">Add Image</span>
              <input type="file" className="hidden" multiple accept="image/*" onChange={onFileChange} />
            </label>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-[14px] text-[#67707e]">
            {["Thumbnail", "Image 2", "Image 3", "Image 4", "Image 5"].map((label) => (
              <div key={label} className="h-16 rounded-sm border border-dashed border-[#cbd4e1] p-2">
                {label}
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Button type="button" variant="destructive" onClick={() => setForm(initialFormState)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Confirming..." : "Confirm"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
