"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrders } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function SubscribePage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["subscribers"],
    queryFn: () => getOrders({ page: 1, limit: 200 }),
  });

  const subscribers = useMemo(() => {
    const map = new Map<string, { email: string; lastOrder: string | undefined; totalOrders: number }>();

    (data?.data || []).forEach((order) => {
      const email = order.customer?.email;
      if (!email) return;

      const existing = map.get(email);
      if (existing) {
        existing.totalOrders += 1;
        if (!existing.lastOrder || new Date(order.createdAt || 0) > new Date(existing.lastOrder)) {
          existing.lastOrder = order.createdAt;
        }
      } else {
        map.set(email, {
          email,
          totalOrders: 1,
          lastOrder: order.createdAt,
        });
      }
    });

    return Array.from(map.values());
  }, [data]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGINATION_LIMIT;
    return subscribers.slice(start, start + PAGINATION_LIMIT);
  }, [subscribers, page]);

  const totalPages = Math.max(Math.ceil(subscribers.length / PAGINATION_LIMIT), 1);

  return (
    <div className="space-y-6">
      <SectionHeader title="Subscribe" description="Subscriber list from recent customers" />

      {isLoading ? (
        <TableSkeleton columns={4} rows={8} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((subscriber) => (
                <TableRow key={subscriber.email}>
                  <TableCell>{subscriber.email}</TableCell>
                  <TableCell>{subscriber.totalOrders}</TableCell>
                  <TableCell>{formatDate(subscriber.lastOrder)}</TableCell>
                  <TableCell>
                    <Badge variant="success">Subscribed</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">Showing {(page - 1) * PAGINATION_LIMIT + 1} to {Math.min(page * PAGINATION_LIMIT, subscribers.length)} in first entries</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

