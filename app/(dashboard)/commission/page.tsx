"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrders, getVendors } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function CommissionPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["commission"],
    queryFn: async () => {
      const [vendors, orders] = await Promise.all([getVendors(), getOrders({ page: 1, limit: 200 })]);
      return { vendors: vendors.data, orders: orders.data };
    },
  });

  const rows = useMemo(() => {
    const vendors = data?.vendors || [];
    const orders = data?.orders || [];

    return vendors.map((vendor) => {
      const vendorOrders = orders.filter((order) => order.vendor?._id === vendor._id);
      const totalSales = vendorOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const commission = totalSales * 0.1;
      return {
        id: vendor._id,
        vendorName: vendor.storeName || vendor.name || vendor.email,
        email: vendor.email,
        orders: vendorOrders.length,
        totalSales,
        commission,
      };
    });
  }, [data]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGINATION_LIMIT;
    return rows.slice(start, start + PAGINATION_LIMIT);
  }, [rows, page]);

  const totalPages = Math.max(Math.ceil(rows.length / PAGINATION_LIMIT), 1);

  return (
    <div className="space-y-6">
      <SectionHeader title="Commission" description="Vendor-wise commission report" />

      {isLoading ? (
        <TableSkeleton columns={6} rows={8} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.vendorName}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.orders}</TableCell>
                  <TableCell>{formatCurrency(row.totalSales)}</TableCell>
                  <TableCell>10%</TableCell>
                  <TableCell className="font-semibold text-[#1f73e8]">{formatCurrency(row.commission)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">Showing {(page - 1) * PAGINATION_LIMIT + 1} to {Math.min(page * PAGINATION_LIMIT, rows.length)} in first entries</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

