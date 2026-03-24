"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getVendorById } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function VendorDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => getVendorById(id),
    enabled: Boolean(id),
  });

  const vendor = data?.data;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Details"
        action={
          <Link href="/vendors/requests">
            <Button variant="ghost">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </Link>
        }
      />

      {isLoading || !vendor ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-32 rounded-full" />
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <div className="max-w-4xl space-y-6">
          <div>
            <h2 className="text-[28px] font-semibold leading-[150%] text-[#1f73e8]">Profile Image</h2>
            <div className="relative mt-3 h-20 w-20 overflow-hidden rounded-full bg-[#e7edf7]">
              {vendor.storeLogo?.url || vendor.avatar?.url ? (
                <Image
                  src={vendor.storeLogo?.url || vendor.avatar?.url || ""}
                  alt={vendor.storeName || vendor.email}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-[16px] font-semibold leading-[150%]">Name</h3>
              <p className="mt-1 text-[16px] leading-[150%] text-[#7a818c]">{vendor.name || vendor.email.split("@")[0]}</p>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold leading-[150%]">Store Name</h3>
              <p className="mt-1 text-[16px] leading-[150%] text-[#7a818c]">{vendor.storeName || "Store Name Here"}</p>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold leading-[150%]">Description</h3>
              <p className="mt-1 text-[16px] leading-[150%] text-[#7a818c]">
                {vendor.storeDescription || "No store description provided."}
              </p>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold leading-[150%]">Email</h3>
              <p className="mt-1 text-[16px] leading-[150%] text-[#7a818c]">{vendor.email}</p>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold leading-[150%]">Phone Number</h3>
              <p className="mt-1 text-[16px] leading-[150%] text-[#7a818c]">{vendor.phone || "-"}</p>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold leading-[150%]">Address</h3>
              <p className="mt-1 text-[16px] leading-[150%] text-[#7a818c]">{vendor.address || "-"}</p>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold leading-[150%]">Birthday</h3>
              <p className="mt-1 text-[16px] leading-[150%] text-[#7a818c]">{formatDate(vendor.createdAt)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[28px] font-semibold leading-[150%] text-[#1f73e8]">Identification Documents</h3>
            <div>
              <h4 className="text-[16px] font-semibold leading-[150%]">ID Card</h4>
              <p className="mt-1 text-[16px] leading-[150%] text-[#7a818c]">{vendor.idCard || "-"}</p>
            </div>
            <div>
              <h4 className="text-[16px] font-semibold leading-[150%]">Passport</h4>
              <p className="mt-1 text-[16px] leading-[150%] text-[#7a818c]">{vendor.passport || "-"}</p>
            </div>
            <div>
              <h4 className="text-[16px] font-semibold leading-[150%]">Residence Permit</h4>
              <p className="mt-1 text-[16px] leading-[150%] text-[#7a818c]">{vendor.address || "-"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
