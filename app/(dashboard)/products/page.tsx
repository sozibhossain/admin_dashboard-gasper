"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteProduct, getProducts, verifyProduct } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import type { Product } from "@/types/api";
import { formatCurrency, formatDate, toErrorMessage } from "@/lib/utils";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [detailsTarget, setDetailsTarget] = useState<Product | null>(null);
  const [verificationTarget, setVerificationTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, filter, stockFilter],
    queryFn: () =>
      getProducts({
        page,
        limit: PAGINATION_LIMIT,
        sort: "latest",
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => verifyProduct(id),
    onSuccess: (response) => {
      toast.success(response.message || "Product verified");
      setVerificationTarget(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (response) => {
      toast.success(response.message || "Product deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const products = useMemo(() => data?.data.products ?? [], [data]);
  const meta = data?.data.pagination;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const verificationMatch =
        filter === "all" || (filter === "verified" ? product.verified : !product.verified);
      const stockMatch =
        stockFilter === "all" || (stockFilter === "in_stock" ? product.stock > 0 : product.stock <= 0);
      return verificationMatch && stockMatch;
    });
  }, [products, filter, stockFilter]);

  const totalPages = Math.max(Math.ceil((meta?.total || filteredProducts.length) / (meta?.limit || PAGINATION_LIMIT)), 1);

  return (
    <div className="space-y-6">
      <SectionHeader title="Products" description={`${meta?.total || 0} products found`} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "verified" | "unverified")}> 
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="unverified">Unverified</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full max-w-[260px]">
          <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as "all" | "in_stock" | "out_of_stock")}>
            <SelectTrigger>
              <SelectValue placeholder="Filter stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={7} rows={8} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState title="Oops!" description="No Product Found. Ready to start selling something awesome." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Details</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Verification Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-sm bg-[#f1f4f9]">
                        {product.photos?.[0]?.url ? (
                          <Image src={product.photos[0].url} alt={product.title} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-[16px] font-semibold leading-[150%] text-[#1a1a1a]">{product.title}</p>
                        <p className="text-[14px] text-[#737b86]">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.vendor?.storeName || product.vendor?.name || "Name Here"}</TableCell>
                  <TableCell>10%</TableCell>
                  <TableCell>
                    <Badge variant={product.verified ? "success" : "destructive"}>
                      {product.verified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 0 ? "success" : "destructive"}>
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setDetailsTarget(product)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setVerificationTarget(product)}>
                        <Check className="mr-2 h-4 w-4" />
                        Verification
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(product)}>
                        <Trash2 className="h-5 w-5 text-[#ef3030]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">Showing {(page - 1) * PAGINATION_LIMIT + 1} to {Math.min(page * PAGINATION_LIMIT, meta?.total || filteredProducts.length)} in first entries</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <Dialog open={Boolean(detailsTarget)} onOpenChange={(open) => !open && setDetailsTarget(null)}>
        <DialogContent className="max-w-[620px]">
          <DialogHeader>
            <DialogTitle className="text-center">Product Details</DialogTitle>
            <DialogDescription className="text-center text-[#69717d]">
              Complete information for selected product.
            </DialogDescription>
          </DialogHeader>

          {detailsTarget ? (
            <div className="space-y-4 py-2">
              <div className="grid gap-2 sm:grid-cols-3">
                {(detailsTarget.photos || []).slice(0, 3).map((photo, index) =>
                  photo?.url ? (
                    <div key={photo.public_id || `${photo.url}-${index}`} className="relative h-24 overflow-hidden rounded-sm bg-[#f1f4f9]">
                      <Image src={photo.url} alt={`${detailsTarget.title} ${index + 1}`} fill className="object-cover" />
                    </div>
                  ) : (
                    <div key={`placeholder-${index}`} className="h-24 rounded-sm bg-[#f1f4f9]" />
                  )
                )}
              </div>

              <div className="space-y-3 border-y border-[#e2e8f0] py-4 text-[15px]">
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Product ID</span>
                  <span className="max-w-[65%] truncate text-right">{detailsTarget._id}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Title</span>
                  <span className="max-w-[65%] text-right font-medium text-[#1f73e8]">{detailsTarget.title}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Description</span>
                  <span className="max-w-[65%] text-right">{detailsTarget.description || "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Brand</span>
                  <span>{detailsTarget.brand || "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">SKU</span>
                  <span>{detailsTarget.sku || "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Price</span>
                  <span>{formatCurrency(detailsTarget.price)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Stock</span>
                  <span>{detailsTarget.stock}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Stock Status</span>
                  <span>{detailsTarget.status || "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Verification</span>
                  <span>{detailsTarget.verified ? "Verified" : "Unverified"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Category</span>
                  <span>{detailsTarget.category?.name || "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Vendor</span>
                  <span>{detailsTarget.vendor?.storeName || detailsTarget.vendor?.name || "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Vendor Email</span>
                  <span>{detailsTarget.vendor?.email || "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Sold Count</span>
                  <span>{detailsTarget.soldCount ?? 0}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Rating</span>
                  <span>{detailsTarget.rating ?? 0}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Reviews Count</span>
                  <span>{detailsTarget.reviewsCount ?? 0}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Colors</span>
                  <span className="max-w-[65%] text-right">{detailsTarget.colors?.join(", ") || "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#5c6470]">Created At</span>
                  <span>{formatDate(detailsTarget.createdAt)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(verificationTarget)} onOpenChange={(open) => !open && setVerificationTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Verification Status</DialogTitle>
            <DialogDescription className="text-center text-[#69717d]">
              Review product details before verification.
            </DialogDescription>
          </DialogHeader>

          {verificationTarget ? (
            <div className="space-y-3 border-y border-[#e2e8f0] py-4 text-[16px]">
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Product Name</span>
                <span className="font-medium text-[#1f73e8]">{verificationTarget.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">SKU</span>
                <span>{verificationTarget.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Price</span>
                <span>{formatCurrency(verificationTarget.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Current Status</span>
                <span>{verificationTarget.verified ? "Verified" : "Unverified"}</span>
              </div>
            </div>
          ) : null}

          <DialogFooter className="sm:grid sm:grid-cols-2 sm:gap-3">
            <Button className="w-full" variant="outline" onClick={() => setVerificationTarget(null)}>
              Cancel
            </Button>
            <Button
              className="w-full"
              onClick={() => verificationTarget && verifyMutation.mutate(verificationTarget._id)}
              disabled={verifyMutation.isPending || !verificationTarget || verificationTarget.verified}
            >
              <Check className="mr-2 h-4 w-4" />
              {verificationTarget?.verified ? "Already Verified" : verifyMutation.isPending ? "Verifying..." : "Verify Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-center !text-[#e10000]">Are You Sure To Delete this Product?</DialogTitle>
            <DialogDescription className="text-center">This action cannot be undone.</DialogDescription>
          </DialogHeader>

          {deleteTarget ? (
            <div className="space-y-3 border-y border-[#e2e8f0] py-4 text-[16px]">
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Product Name</span>
                <span className="font-medium text-[#1f73e8]">{deleteTarget.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">SKU</span>
                <span>{deleteTarget.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Price</span>
                <span>{formatCurrency(deleteTarget.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Vendor</span>
                <span>{deleteTarget.vendor?.storeName || deleteTarget.vendor?.name || "-"}</span>
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
