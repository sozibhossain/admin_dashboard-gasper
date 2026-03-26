"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Users, Wallet, Package, Clock3, CircleCheck, CircleEllipsis } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getDashboardStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

const summaryCards = [
  {
    key: "ordersPending",
    title: "Order Pending!",
    icon: Clock3,
    iconClass: "bg-[#f8d7c9] text-[#c98261]",
  },
  {
    key: "ordersProcessing",
    title: "Order Processing!",
    icon: CircleEllipsis,
    iconClass: "bg-[#cde4ff] text-[#1f73e8]",
  },
  {
    key: "ordersCompleted",
    title: "Order Completed!",
    icon: CircleCheck,
    iconClass: "bg-[#d2efe8] text-[#18886b]",
  },
  {
    key: "totalProducts",
    title: "Total Products!",
    icon: Package,
    iconClass: "bg-[#d9d8eb] text-[#6461a8]",
  },
  {
    key: "totalCustomers",
    title: "Total Customers!",
    icon: Users,
    iconClass: "bg-[#f5d6e3] text-[#b2557f]",
  },
  {
    key: "totalCommission",
    title: "Total Comission",
    icon: Wallet,
    iconClass: "bg-[#cae8cd] text-[#327f3e]",
  },
] as const;

const radialStats = [
  { title: "New Customer", subtitle: "Last 30 days", border: "border-[#f8c43c]", key: "ordersPending" },
  { title: "Total Customers", subtitle: "All Time", border: "border-[#16b6cc]", key: "totalCustomers" },
  { title: "Total Sales", subtitle: "Last 30 days", border: "border-[#6a2ed9]", key: "ordersCompleted" },
  { title: "Commissions", subtitle: "All Time", border: "border-[#1aa03a]", key: "ordersProcessing" },
] as const;

function DetailsButton({ href }: { href: string }) {
  return (
    <Link href={href}>
      <Button variant="secondary" className="h-5 rounded-[2px] px-2 text-[10px] font-semibold text-[#1f73e8]">
        <Eye className="mr-1 h-2.5 w-2.5" /> Details
      </Button>
    </Link>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const stats = data?.data.stats;
  const orders = useMemo(() => data?.data.orders ?? [], [data]);
  const products = useMemo(() => data?.data.products ?? [], [data]);

  const recentCustomerRows = useMemo(() => {
    return orders
      .filter((order) => order.customer?.email)
      .map((order) => ({
        email: order.customer?.email || "-",
        orderDate: order.createdAt,
        orderId: order.orderId,
      }))
      .slice(0, 5);
  }, [orders]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-44" />
          ))}
        </div>
        <Skeleton className="h-56" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  if (!stats) {
    return <EmptyState title="No Data" description="Unable to load dashboard statistics right now." />;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <Card key={card.key} className="rounded-none">
              <CardContent className="flex min-h-[102px] items-start justify-between gap-2 p-3">
                <div>
                  <p className="text-[16px] font-semibold leading-[150%] text-[#0c0c0c]">{card.title}</p>
                  <p className="text-[12px] font-normal leading-[150%] text-[#6e7782]">Today</p>
                  <p className="mt-1 text-[24px] font-semibold leading-[100%] text-[#153c72]">
                    {card.key === "totalCommission" ? formatCurrency(Number(value)) : value}
                  </p>
                </div>
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${card.iconClass}`}>
                  <Icon className="h-6 w-6" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {radialStats.map((item) => (
          <Card key={item.title} className="rounded-none">
            <CardContent className="flex min-h-[176px] flex-col items-center justify-center gap-2 p-3">
              <div className={`flex h-[112px] w-[112px] items-center justify-center rounded-full border-[9px] ${item.border}`}>
                <span className="text-[24px] font-normal leading-[100%] text-[#1d1d1d]">{stats[item.key]}</span>
              </div>
              <p className="text-[16px] font-semibold leading-[150%] text-[#1d1d1d]">{item.title}</p>
              <p className="text-[12px] leading-[150%] text-[#6d7681]">{item.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-2 xl:grid-cols-2">
        <Card className="rounded-none">
          <CardHeader className="p-3">
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead className="w-[88px] text-center"> </TableHead>
                  <TableHead className="text-right">Order Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="text-[13px]">{order.orderId || "t54gpf468y28hf"}</TableCell>
                    <TableCell className="text-center">
                      <DetailsButton href={`/orders?orderId=${order.orderId}`} />
                    </TableCell>
                    <TableCell className="text-right text-[13px]">{formatDate(order.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="p-3">
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customers Email</TableHead>
                  <TableHead className="w-[88px] text-center"> </TableHead>
                  <TableHead className="text-right">Order Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCustomerRows.map((row) => (
                  <TableRow key={`${row.email}-${row.orderId}`}>
                    <TableCell className="text-[13px]">{row.email}</TableCell>
                    <TableCell className="text-center">
                      <DetailsButton href={`/orders?orderId=${row.orderId}`} />
                    </TableCell>
                    <TableCell className="text-right text-[13px]">{formatDate(row.orderDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none">
        <CardHeader className="p-3">
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Images</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 5).map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="relative h-10 w-14 overflow-hidden rounded-[2px] bg-[#eef2f8]">
                      {product.photos?.[0]?.url ? (
                        <Image src={product.photos[0].url} alt={product.title} fill className="object-cover" />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-[12px] uppercase text-[#9ba1ac]">
                    {product.title}
                  </TableCell>
                  <TableCell className="text-[12px] text-[#9ba1ac]">{product.category?.name || "Electronic"}</TableCell>
                  <TableCell className="text-[12px] text-[#9ba1ac]">Physical</TableCell>
                  <TableCell className="text-[12px] text-[#9ba1ac]">{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-right">
                    <DetailsButton href="/products" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
