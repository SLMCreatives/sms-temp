"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";
import { resolveAnySstByName, SstMember } from "@/lib/sst-members";

/**
 * Resolves the signed-in user to an SST roster member, so a check can record
 * who ticked it without asking them to pick their own name. Matches the whole
 * roster including the manager — otherwise the manager's ticks land unattributed.
 */
export function useCurrentSst() {
  const [member, setMember] = React.useState<SstMember | null>(null);
  const [displayName, setDisplayName] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (cancelled) return;
        const name: string =
          data.user?.user_metadata?.full_name ?? data.user?.email ?? "";
        setDisplayName(name);
        setMember(resolveAnySstByName(name));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { member, displayName, loading };
}
