"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, getProfile, updateProfile } from "@/lib/api";
import { toErrorMessage } from "@/lib/utils";

type ProfileForm = {
  name: string;
  phone: string;
  address: string;
  nationality: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const initialPasswordForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [profileForm, setProfileForm] = useState<Partial<ProfileForm>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(initialPasswordForm);

  const { data: profileResponse, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    refetchOnWindowFocus: false,
  });

  const profile = profileResponse?.data;
  const resolvedProfileForm: ProfileForm = {
    name: profileForm.name ?? profile?.name ?? "",
    phone: profileForm.phone ?? profile?.phone ?? "",
    address: profileForm.address ?? profile?.address ?? "",
    nationality: profileForm.nationality ?? profile?.nationality ?? "",
  };

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      toast.success(response.message || "Profile updated");
      setAvatarFile(null);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (response) => {
      toast.success(response.message || "Password changed");
      setPasswordForm(initialPasswordForm);
    },
    onError: (error) => toast.error(toErrorMessage(error)),
  });

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(event.target.files?.[0] || null);
  };

  const setProfileField = (field: keyof ProfileForm, value: string) => {
    setProfileForm((previous) => ({ ...previous, [field]: value }));
  };

  const setPasswordField = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((previous) => ({ ...previous, [field]: value }));
  };

  const resetProfileForm = () => {
    setProfileForm({});
    setAvatarFile(null);
  };

  const onProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = new FormData();
    const trimmedName = resolvedProfileForm.name.trim();
    const trimmedPhone = resolvedProfileForm.phone.trim();
    const trimmedAddress = resolvedProfileForm.address.trim();
    const trimmedNationality = resolvedProfileForm.nationality.trim();

    if (trimmedName) payload.append("name", trimmedName);
    if (trimmedPhone) payload.append("phone", trimmedPhone);
    if (trimmedAddress) payload.append("address", trimmedAddress);
    if (trimmedNationality) payload.append("nationality", trimmedNationality);
    if (avatarFile) payload.append("avatar", avatarFile);

    profileMutation.mutate(payload);
  };

  const onPasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    passwordMutation.mutate(passwordForm);
  };

  const displayName = resolvedProfileForm.name || profile?.name || profile?.email || "User";

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" description="Security and account settings" />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information and avatar</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onProfileSubmit}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#d8dbe1] bg-[#eef2f8]">
                {profile?.avatar?.url ? (
                  <Image src={profile.avatar.url} alt={displayName} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[20px] font-semibold text-[#516176]">
                    {getInitials(displayName)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[18px] font-semibold text-[#111827]">{displayName}</p>
                <p className="text-[14px] text-[#6b7280]">{profile?.email || "-"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <label className="flex min-h-[136px] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-[#c7ced9] bg-white p-4 text-center">
                <UploadCloud className="h-8 w-8 text-[#1f73e8]" />
                <p className="mt-3 text-[#5a6370]">{avatarFile ? avatarFile.name : "Drag and drop image here, or click add image"}</p>
                <span className="mt-3 inline-flex h-9 items-center rounded-sm bg-[#1f73e8] px-4 text-[16px] text-white">Add Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={onAvatarChange} />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Name</Label>
                <Input
                  id="profile-name"
                  value={resolvedProfileForm.name}
                  onChange={(event) => setProfileField("name", event.target.value)}
                  disabled={isProfileLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" value={profile?.email || ""} readOnly disabled />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  value={resolvedProfileForm.phone}
                  onChange={(event) => setProfileField("phone", event.target.value)}
                  disabled={isProfileLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-nationality">Nationality</Label>
                <Input
                  id="profile-nationality"
                  value={resolvedProfileForm.nationality}
                  onChange={(event) => setProfileField("nationality", event.target.value)}
                  disabled={isProfileLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-address">Address</Label>
              <Input
                id="profile-address"
                value={resolvedProfileForm.address}
                onChange={(event) => setProfileField("address", event.target.value)}
                disabled={isProfileLoading}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Button type="button" variant="outline" onClick={resetProfileForm}>
                Reset
              </Button>
              <Button type="submit" disabled={profileMutation.isPending || isProfileLoading}>
                {profileMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Use your current password to set a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onPasswordSubmit}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordField("currentPassword", event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordField("newPassword", event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordField("confirmPassword", event.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
