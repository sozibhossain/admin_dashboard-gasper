"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "@/components/shared/section-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getVendors } from "@/lib/api";
import { PAGINATION_LIMIT } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function StaffPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: getVendors,
  });

  const staff = useMemo(() => {
    return (data?.data || []).map((vendor) => ({
      _id: vendor._id,
      name: vendor.name || vendor.email.split("@")[0],
      email: vendor.email,
      role: vendor.role,
      status: vendor.vendorStatus,
      joinedAt: vendor.createdAt,
    }));
  }, [data]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGINATION_LIMIT;
    return staff.slice(start, start + PAGINATION_LIMIT);
  }, [staff, page]);

  const totalPages = Math.max(Math.ceil(staff.length / PAGINATION_LIMIT), 1);

  return (
    <div className="space-y-6">
      <SectionHeader title="Manage Staff" description="Admin and manager account overview" />

      {isLoading ? (
        <TableSkeleton columns={5} rows={8} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((member) => (
                <TableRow key={member._id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === "approved" ? "success" : member.status === "pending" ? "warning" : "neutral"}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(member.joinedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] text-[#6d7681]">Showing {(page - 1) * PAGINATION_LIMIT + 1} to {Math.min(page * PAGINATION_LIMIT, staff.length)} in first entries</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

