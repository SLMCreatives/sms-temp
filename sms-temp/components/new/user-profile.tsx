import { createClient } from "@/lib/supabase/server";
import { UserProfileClient } from "./user-profile-client";

function getInitials(email: string, fullName?: string): string {
  if (fullName) {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export async function UserProfile() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) return null;

  const fullName: string | undefined = user.user_metadata?.full_name ?? user.user_metadata?.name;
  const avatarUrl: string | undefined = user.user_metadata?.avatar_url;
  const initials = getInitials(user.email ?? "??", fullName);

  return (
    <UserProfileClient
      avatarUrl={avatarUrl}
      initials={initials}
      fullName={fullName}
    />
  );
}
