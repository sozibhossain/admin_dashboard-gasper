"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getVendors } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function VendorsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: getVendors,
  });

  const vendors = useMemo(
    () => (data?.data || []).filter((vendor) => vendor.vendorStatus === "approved" || vendor.role === "admin"),
    [data]
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGINATION_LIMIT;
    return vendors.slice(start, start + PAGINATION_LIMIT);
  }, [vendors, page]);

  const totalPages = Math.max(Math.ceil(vendors.length / PAGINATION_LIMIT), 1);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Vendor List"
        action={
          <Link href="/vendors/requests">
            <Button>
              <BadgeCheck className="mr-2 h-4 w-4" /> Vendor Requests ({(data?.data || []).filter((vendor) => vendor.vendorStatus === "pending").length})
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <TableSkeleton columns={7} rows={8} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Total Products</TableHead>
                <TableHead>Total Commission</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((vendor) => (
                <TableRow key={vendor._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={vendor.storeLogo?.url || vendor.avatar?.url} alt={vendor.name || vendor.email} />
                        <AvatarFallback>{(vendor.name || vendor.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-[#1f73e8]">{vendor.name || vendor.email.split("@")[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.storeName || "Store Name"}</TableCell>
                  <TableCell>{vendor.address || "Location Here"}</TableCell>
                  <TableCell>123</TableCell>
                  <TableCell>{formatCurrency(123)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link href={`/vendors/${vendor._id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon" onClick={() => toast.info("Delete vendor endpoint not available")}> 
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">Showing {(page - 1) * PAGINATION_LIMIT + 1} to {Math.min(page * PAGINATION_LIMIT, vendors.length)} in first entries</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

