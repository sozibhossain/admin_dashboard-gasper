"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { approveVendor, getVendors } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import { formatDate, toErrorMessage } from "@/lib/utils";

export default function VendorRequestsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["vendors", "requests"],
    queryFn: getVendors,
  });

  const mutation = useMutation({
    mutationFn: approveVendor,
    onSuccess: (response) => {
      toast.success(response.message || "Vendor approved");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const pendingVendors = useMemo(
    () => (data?.data || []).filter((vendor) => vendor.vendorStatus === "pending"),
    [data]
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGINATION_LIMIT;
    return pendingVendors.slice(start, start + PAGINATION_LIMIT);
  }, [pendingVendors, page]);

  const totalPages = Math.max(Math.ceil(pendingVendors.length / PAGINATION_LIMIT), 1);

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Vendor Request (${pendingVendors.length})`}
        action={
          <Link href="/vendors">
            <Button variant="ghost">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to vendors
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <TableSkeleton columns={5} rows={8} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Submitted date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((vendor) => (
                <TableRow key={vendor._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-20 overflow-hidden rounded-sm bg-[#eef2f8]">
                        {vendor.storeLogo?.url ? (
                          <Image src={vendor.storeLogo.url} alt={vendor.storeName || vendor.email} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-[16px] font-semibold leading-[150%]">{vendor.storeName || "Vendor Name"}</p>
                        <p className="text-[14px] text-[#707986]">{vendor.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-[14px] text-[#a0a8b2]">Valid Until</p>
                    <p className="text-[16px] font-semibold leading-[150%] text-[#1d1d1d]">{formatDate(vendor.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    <Link href={`/vendors/${vendor._id}`}>
                      <Button variant="secondary">Details</Button>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => toast.info("Reject endpoint is not available in backend")}> 
                        <Trash2 className="h-5 w-5 text-[#ef3030]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => mutation.mutate(vendor._id)}
                        disabled={mutation.isPending}
                      >
                        <Check className="h-5 w-5 text-[#0c9b31]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">Showing {(page - 1) * PAGINATION_LIMIT + 1} to {Math.min(page * PAGINATION_LIMIT, pendingVendors.length)} in first entries</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

