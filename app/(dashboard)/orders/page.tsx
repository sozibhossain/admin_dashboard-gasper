"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ChevronDown, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import type { Order } from "@/types/api";
import { formatCurrency, formatDate, toErrorMessage } from "@/lib/utils";

const statusMap: Record<Order["status"], { label: string; variant: "success" | "warning" | "destructive" | "default" }> = {
  pending: { label: "Pending", variant: "warning" },
  in_progress: { label: "Processing", variant: "default" },
  shipped: { label: "Shipped", variant: "default" },
  delivered: { label: "Completed", variant: "success" },
  cancelled: { label: "Canceled", variant: "destructive" },
};

const filterMap = {
  all: undefined,
  completed: "delivered",
  pending: "pending",
  cancel: "cancelled",
} as const;

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<keyof typeof filterMap>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page, filter],
    queryFn: () =>
      getOrders({
        page,
        limit: PAGINATION_LIMIT,
        status: filterMap[filter],
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => updateOrderStatus(orderId, { status: "cancelled" }),
    onSuccess: (response) => {
      toast.success(response.message || "Order canceled");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const orders = data?.data || [];
  const hasNextPage = orders.length === PAGINATION_LIMIT;
  const totalPages = Math.max(page + (hasNextPage ? 1 : 0), 1);

  const titleCount = useMemo(() => {
    if (filter === "all") return "";
    return ` (${orders.length} ${filter} found)`;
  }, [filter, orders.length]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Order${titleCount}`}
        description={`${orders.length} orders found`}
        action={
          <Button className="h-12 rounded-sm px-4 text-[16px]">
            <CalendarDays className="mr-2 h-4 w-4" /> 12 July, 2025 <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      <Tabs
        value={filter}
        onValueChange={(value) => {
          setFilter(value as keyof typeof filterMap);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="cancel">Cancel</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <TableSkeleton columns={7} rows={8} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-semibold text-[#3f4651]">#{order.orderId}</TableCell>
                  <TableCell>{order.items?.[0]?.product?.title || "Product Name Here"}</TableCell>
                  <TableCell>{order.customer?.name || "Customer Name"}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[order.status]?.variant || "default"}>
                      {statusMap[order.status]?.label || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => toast.info("Download feature can be attached to invoice API")}> 
                        <Download className="h-5 w-5 text-[#19963a]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => cancelMutation.mutate(order.orderId)}
                        disabled={cancelMutation.isPending}
                      >
                        <Trash2 className="h-5 w-5 text-[#ef3030]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">Showing {(page - 1) * PAGINATION_LIMIT + 1} to {Math.min(page * PAGINATION_LIMIT, (page - 1) * PAGINATION_LIMIT + orders.length)} entries</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

