"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createCoupon, deleteCoupon, getCoupons, updateCoupon } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import type { Coupon } from "@/types/api";
import { formatDate, toErrorMessage } from "@/lib/utils";

type CouponForm = {
  code: string;
  description: string;
  discount: string;
  validityStart: string;
  validityEnd: string;
  status: "active" | "inactive";
};

const initialForm: CouponForm = {
  code: "",
  description: "",
  discount: "",
  validityStart: "",
  validityEnd: "",
  status: "active",
};

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState<Coupon | null>(null);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CouponForm>(initialForm);

  const { data, isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => getCoupons(),
  });

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: (response) => {
      toast.success(response.message || "Coupon created");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setCreateOpen(false);
      setForm(initialForm);
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateCoupon>[1] }) => updateCoupon(id, payload),
    onSuccess: (response) => {
      toast.success(response.message || "Coupon updated");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setEditing(null);
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: (response) => {
      toast.success(response.message || "Coupon deleted");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const coupons = useMemo(() => data?.data ?? [], [data]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGINATION_LIMIT;
    return coupons.slice(start, start + PAGINATION_LIMIT);
  }, [coupons, page]);

  const totalPages = Math.max(Math.ceil(coupons.length / PAGINATION_LIMIT), 1);

  const onCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate({
      code: form.code,
      description: form.description,
      discount: Number(form.discount),
      discountType: "percentage",
      validityStart: form.validityStart,
      validityEnd: form.validityEnd,
      status: form.status,
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Coupons"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Coupons Request ({coupons.length})
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton columns={6} rows={8} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coupon Name</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-20 overflow-hidden rounded-sm bg-[#eef2f8]">
                        {coupon.couponImage?.url ? (
                          <Image src={coupon.couponImage.url} alt={coupon.code} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-[16px] font-semibold leading-[150%] text-[#1a1a1a]">{coupon.code}</p>
                        <p className="text-[14px] text-[#9aa1ac]">{coupon.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-[14px] text-[#afb4bc]">Valid Until</p>
                    <p className="text-[16px] font-semibold leading-[150%]">{formatDate(coupon.validityEnd)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-[14px] text-[#afb4bc]">Discount</p>
                    <p className="text-[16px] font-semibold leading-[150%]">{coupon.discount}%</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.status === "active" ? "success" : "neutral"}>{coupon.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setDetails(coupon)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditing(coupon)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(coupon._id)}>
                        <Trash2 className="h-4 w-4 text-[#ef3030]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">Showing {(page - 1) * PAGINATION_LIMIT + 1} to {Math.min(page * PAGINATION_LIMIT, coupons.length)} in first entries</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <Dialog open={Boolean(details)} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-center">Coupons Details</DialogTitle>
          </DialogHeader>
          {details ? (
            <div className="space-y-3 border-y border-[#e2e8f0] py-4 text-[16px]">
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Coupon Name</span>
                <span className="font-medium text-[#1f73e8]">{details.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Validity</span>
                <span>{formatDate(details.validityEnd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Discount</span>
                <span>{details.discount}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Current Status</span>
                <span>{details.status}</span>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              className="w-full"
              variant={details?.status === "active" ? "destructive" : "default"}
              onClick={() => {
                if (!details) return;
                updateMutation.mutate({
                  id: details._id,
                  payload: { status: details.status === "active" ? "inactive" : "active" },
                });
                setDetails(null);
              }}
            >
              {details?.status === "active" ? "Inactive" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-center">Edit Coupon</DialogTitle>
            <DialogDescription className="text-center">Quick status and discount update</DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input value={editing.code} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={editing.discount}
                  onChange={(event) =>
                    setEditing((previous) =>
                      previous ? { ...previous, discount: Number(event.target.value || 0) } : previous
                    )
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  className="w-full"
                  onClick={() => {
                    updateMutation.mutate({
                      id: editing._id,
                      payload: {
                        discount: editing.discount,
                        status: editing.status,
                      },
                    });
                  }}
                >
                  Update Coupon
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-center">Create Coupon</DialogTitle>
            <DialogDescription className="text-center">Add a new coupon for campaign</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onCreateSubmit}>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={form.code} onChange={(event) => setForm((previous) => ({ ...previous, code: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={form.discount}
                  onChange={(event) => setForm((previous) => ({ ...previous, discount: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="h-11 w-full rounded-sm border border-[#c9ccd3] px-3 text-[16px]"
                  value={form.status}
                  onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value as CouponForm["status"] }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Validity Start</Label>
                <Input
                  type="date"
                  value={form.validityStart}
                  onChange={(event) => setForm((previous) => ({ ...previous, validityStart: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Validity End</Label>
                <Input
                  type="date"
                  value={form.validityEnd}
                  onChange={(event) => setForm((previous) => ({ ...previous, validityEnd: event.target.value }))}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full" type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

