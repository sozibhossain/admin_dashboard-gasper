"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCustomersFromOrders } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import type { CustomerSummary } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState<CustomerSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerSummary | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page],
    queryFn: () => getCustomersFromOrders({ page, limit: PAGINATION_LIMIT }),
  });

  const customers = data?.data.customers || [];
  const meta = data?.data.pagination;

  return (
    <div className="space-y-6">
      <SectionHeader title="Customer List" />

      {isLoading ? (
        <TableSkeleton columns={8} rows={8} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Money Spent</TableHead>
                <TableHead>Last order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                        <AvatarFallback>{customer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-[#1f73e8]">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>{formatCurrency(customer.moneySpent)}</TableCell>
                  <TableCell>{formatDate(customer.lastOrderAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => setDetails(customer)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setDeleteTarget(customer)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">
              Showing {(page - 1) * PAGINATION_LIMIT + 1} to {Math.min(page * PAGINATION_LIMIT, meta?.total || 0)} in first entries
            </p>
            <Pagination page={page} totalPages={meta?.totalPages || 1} onPageChange={setPage} />
          </div>
        </>
      )}

      <Dialog open={Boolean(details)} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center">Customer Details</DialogTitle>
            <DialogDescription className="text-center">Detailed information for selected customer</DialogDescription>
          </DialogHeader>
          {details ? (
            <div className="space-y-3 border-y border-[#e2e8f0] py-4 text-[16px]">
              <div className="flex justify-between">
                <span className="text-[#5c6470]">User Name</span>
                <span className="font-medium text-[#1f73e8]">{details.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Email</span>
                <span>{details.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Phone</span>
                <span>{details.phone || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Joining Date</span>
                <span>{formatDate(details.lastOrderAt)}</span>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-center !text-[#e10000]">Are You Sure To Delete this Customer?</DialogTitle>
            <DialogDescription className="text-center">Customer Details</DialogDescription>
          </DialogHeader>

          {deleteTarget ? (
            <div className="space-y-3 border-y border-[#e2e8f0] py-4 text-[16px]">
              <div className="flex justify-between">
                <span className="text-[#5c6470]">User Name</span>
                <span className="font-medium text-[#1f73e8]">{deleteTarget.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Email</span>
                <span>{deleteTarget.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Phone</span>
                <span>{deleteTarget.phone || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6470]">Joining Date</span>
                <span>{formatDate(deleteTarget.lastOrderAt)}</span>
              </div>
            </div>
          ) : null}

          <DialogFooter className="sm:grid sm:grid-cols-1 sm:gap-3">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                toast.info("Customer deletion endpoint is not available in backend yet");
                setDeleteTarget(null);
              }}
            >
              Yes, Delete
            </Button>
            <Button className="w-full" onClick={() => setDeleteTarget(null)}>
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

