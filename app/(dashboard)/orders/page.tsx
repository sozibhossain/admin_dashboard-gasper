"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ChevronDown, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  const [selectedDate, setSelectedDate] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["orders", filter],
    queryFn: () =>
      getOrders({
        page: 1,
        limit: 200,
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

  const orders = useMemo(() => data?.data ?? [], [data]);

  const datesWithCount = useMemo(() => {
    const counts = new Map<string, number>();

    orders.forEach((order) => {
      const date = formatDate(order.createdAt);
      if (date === "-") return;
      counts.set(date, (counts.get(date) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (selectedDate === "all") return orders;
    return orders.filter((order) => formatDate(order.createdAt) === selectedDate);
  }, [orders, selectedDate]);

  const totalPages = Math.max(Math.ceil(filteredOrders.length / PAGINATION_LIMIT), 1);
  const currentPage = Math.min(page, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGINATION_LIMIT;
    return filteredOrders.slice(start, start + PAGINATION_LIMIT);
  }, [filteredOrders, currentPage]);

  const titleCount = useMemo(() => {
    if (filter !== "all") return ` (${filteredOrders.length} ${filter} found)`;
    if (selectedDate !== "all") return ` (${filteredOrders.length} found)`;
    return "";
  }, [filter, filteredOrders.length, selectedDate]);

  const dateButtonLabel = selectedDate === "all" ? "All Order Dates" : selectedDate;
  const showingFrom = filteredOrders.length === 0 ? 0 : (currentPage - 1) * PAGINATION_LIMIT + 1;
  const showingTo = filteredOrders.length === 0 ? 0 : Math.min(currentPage * PAGINATION_LIMIT, filteredOrders.length);

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Order${titleCount}`}
        description={`${filteredOrders.length} orders found`}
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-12 rounded-sm px-4 text-[16px]">
                <CalendarDays className="mr-2 h-4 w-4" /> {dateButtonLabel} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDate("all");
                  setPage(1);
                }}
              >
                All Order Dates ({orders.length})
              </DropdownMenuItem>
              {datesWithCount.length > 0 ? (
                datesWithCount.map((item) => (
                  <DropdownMenuItem
                    key={item.date}
                    onClick={() => {
                      setSelectedDate(item.date);
                      setPage(1);
                    }}
                  >
                    {item.date} ({item.count})
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No order dates</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <Tabs
        value={filter}
        onValueChange={(value) => {
          setFilter(value as keyof typeof filterMap);
          setSelectedDate("all");
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
              {paginatedOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-semibold text-[#3f4651]">#{order.orderId.slice(0, 4)}</TableCell>
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
            <p className="text-[16px] text-[#6d7681]">Showing {showingFrom} to {showingTo} entries</p>
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
