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
import { SectionHeader } from "@/components/shared/section-header";

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
    title: "Total Commission",
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

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const stats = data?.data.stats;
  const orders = useMemo(() => data?.data.orders ?? [], [data]);
  const products = useMemo(() => data?.data.products ?? [], [data]);

  const uniqueCustomerEmails = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((order) => {
      if (order.customer?.email) set.add(order.customer.email);
    });
    return Array.from(set);
  }, [orders]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-36" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-52" />
          ))}
        </div>
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!stats) {
    return <EmptyState title="No Data" description="Unable to load dashboard statistics right now." />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <Card key={card.key}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-[28px] font-semibold leading-[150%] text-[#0c0c0c]">{card.title}</p>
                  <p className="text-[16px] font-normal leading-[150%] text-[#6e7782]">Today</p>
                  <p className="mt-2 text-[28px] font-semibold leading-[150%] text-[#153c72]">
                    {card.key === "totalCommission" ? formatCurrency(Number(value)) : value}
                  </p>
                </div>
                <span className={`flex h-16 w-16 items-center justify-center rounded-full ${card.iconClass}`}>
                  <Icon className="h-8 w-8" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {radialStats.map((item) => (
          <Card key={item.title}>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
              <div className={`flex h-36 w-36 items-center justify-center rounded-full border-[10px] ${item.border}`}>
                <span className="text-[28px] font-semibold leading-[150%] text-[#1d1d1d]">{stats[item.key]}</span>
              </div>
              <p className="text-[28px] font-semibold leading-[150%] text-[#1d1d1d]">{item.title}</p>
              <p className="text-[16px] text-[#6d7681]">{item.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders?orderId=${order.orderId}`}>
                        <Button size="sm" variant="secondary">
                          <Eye className="mr-1 h-3 w-3" /> Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customers Email</TableHead>
                  <TableHead className="text-right">Order Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueCustomerEmails.slice(0, 5).map((email, index) => (
                  <TableRow key={email}>
                    <TableCell>{email}</TableCell>
                    <TableCell className="text-right">{formatDate(orders[index]?.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
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
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 5).map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="relative h-14 w-20 overflow-hidden rounded-sm bg-[#eef2f8]">
                      {product.photos?.[0]?.url ? (
                        <Image
                          src={product.photos[0].url}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{product.title}</TableCell>
                  <TableCell>{product.category?.name || "Electronic"}</TableCell>
                  <TableCell>Physical</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-right">
                    <Link href="/products">
                      <Button variant="secondary" size="sm">
                        <Eye className="mr-1 h-3 w-3" /> Details
                      </Button>
                    </Link>
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
