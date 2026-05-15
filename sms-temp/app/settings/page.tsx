"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const supabase = createClient();

function getInitials(email: string, fullName?: string): string {
  if (fullName) {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function SettingsPage() {
  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setEmail(data.user.email ?? "");
        setDisplayName(
          data.user.user_metadata?.full_name ??
            data.user.user_metadata?.name ??
            ""
        );
        setAvatarUrl(data.user.user_metadata?.avatar_url);
      }
    });
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    setAvatarLoading(true);
    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setAvatarLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatar")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    if (updateError) {
      toast.error("Could not save avatar: " + updateError.message);
    } else {
      setAvatarUrl(publicUrl);
      toast.success("Profile picture updated.");
    }
    setAvatarLoading(false);
    // reset input so selecting the same file again re-triggers onChange
    e.target.value = "";
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName }
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Display name updated.");
    }
    setNameLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setPasswordLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword
    });
    if (signInError) {
      toast.error("Current password is incorrect.");
      setPasswordLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Update your display picture and name.
          </p>
        </div>

        {/* Avatar upload */}
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20 rounded-full">
            <AvatarImage src={avatarUrl} alt={displayName || email} />
            <AvatarFallback className="text-xl">
              {getInitials(email, displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={avatarLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarLoading ? "Uploading..." : "Change picture"}
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF. Max 5 MB.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="opacity-60" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <Button type="submit" disabled={nameLoading}>
            {nameLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>

      {/* Password Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Change password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your current password to set a new one.
          </p>
        </div>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
