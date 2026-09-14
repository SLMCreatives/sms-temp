export type SstMember = {
  id: number;
  slug: string;
  /** Short display name used on badges and in pickers. */
  name: string;
  fullName: string;
  /** Inactive members stay here so historical rows keep their attribution. */
  isActive: boolean;
  /** The manager oversees the team but is not assignable to students. */
  isManager?: boolean;
  /** Older slugs that should still resolve, so existing links keep working. */
  aliases?: string[];
  /** Avatar under /public/sst. Omitted members fall back to their initials. */
  image?: string;
  badgeClass: string;
};

/**
 * Single source of truth for the SST roster, mirroring the `sst` table.
 *
 * Everyone who has ever held a caseload is listed here — 1,607 students and
 * ~2,900 engagements still point at Najwa (3) and Ayu (4), so dropping them
 * outright would blank out their SST column. Use SST_MEMBERS for anything the
 * user picks from, and getSstById for rendering whatever the data says.
 */
export const ALL_SST_MEMBERS: SstMember[] = [
  {
    id: 1,
    slug: "amirul",
    name: "Amirul",
    fullName: "Amirul Adli Bin Mohamed Redzuan",
    isActive: true,
    image: "/sst/amirul.png",
    badgeClass:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-0"
  },
  {
    id: 2,
    slug: "farzana",
    name: "Farzana",
    fullName: "Nurul Farzana Binti Mohd Fadhli",
    isActive: true,
    image: "/sst/farzana.png",
    badgeClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-0"
  },
  {
    id: 3,
    slug: "najwa",
    name: "Najwa",
    fullName: "Kamila Najwa Binti Hasanudin",
    isActive: false,
    image: "/sst/najwa.png",
    badgeClass:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-0"
  },
  {
    id: 4,
    slug: "ayu",
    name: "Ayu",
    fullName: "Ayu Iraruza Binti Kamaruddin",
    isActive: false,
    image: "/sst/ayu.jpeg",
    badgeClass:
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 border-0"
  },
  {
    id: 5,
    slug: "sulaiman",
    name: "Sulaiman",
    fullName: "Sulaiman Shafiq",
    isActive: true,
    isManager: true,
    badgeClass:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-0"
  },
  {
    id: 6,
    slug: "miruthala",
    name: "Miruthala",
    fullName: "Miruthala Sukumaran",
    isActive: true,
    aliases: ["miru"],
    badgeClass:
      "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300 border-0"
  },
  {
    id: 7,
    slug: "adib-nafiz",
    name: "Adib Nafiz",
    fullName: "Adib Nafiz",
    isActive: true,
    aliases: ["adib"],
    badgeClass:
      "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 border-0"
  }
];

/**
 * The four members who currently carry students. Use this for filters, team
 * links and every assign-to dropdown — never the full list.
 */
export const SST_MEMBERS: SstMember[] = ALL_SST_MEMBERS.filter(
  (m) => m.isActive && !m.isManager
);

/** Name lookup for ids, including retired members. */
export const SST_NAMES: Record<number, string> = Object.fromEntries(
  ALL_SST_MEMBERS.map((m) => [m.id, m.name])
);

/** Reverse lookup used by forms that record who handled an engagement. */
export const SST_IDS: Record<string, number> = Object.fromEntries(
  SST_MEMBERS.map((m) => [m.name, m.id])
);

/** Resolves any id ever used, so retired members still render on old rows. */
export function getSstById(id: number | null | undefined) {
  if (id == null) return null;
  return ALL_SST_MEMBERS.find((m) => m.id === id) ?? null;
}

/**
 * Resolves an auth display name (or email) to an assignable member. Matches the
 * short name, full name and aliases, so "Miru", "Miruthala" and
 * "Miruthala Sukumaran" all land on the same person.
 */
export function resolveSstByName(nameOrEmail: string): SstMember | null {
  const q = nameOrEmail.trim().toLowerCase();
  if (!q) return null;

  const candidates = (m: SstMember) => [
    m.name.toLowerCase(),
    m.fullName.toLowerCase(),
    ...(m.aliases ?? [])
  ];

  return (
    SST_MEMBERS.find((m) => candidates(m).includes(q)) ??
    SST_MEMBERS.find((m) => candidates(m).some((c) => q.includes(c))) ??
    null
  );
}

/**
 * Like resolveSstByName but searches the whole roster, manager included.
 *
 * Use this for attribution ("who ticked this check"), where the manager is a
 * valid answer. resolveSstByName stays limited to assignable members because
 * it is used to scope a caseload, and the manager carries no students.
 */
export function resolveAnySstByName(nameOrEmail: string): SstMember | null {
  const q = nameOrEmail.trim().toLowerCase();
  if (!q) return null;

  const candidates = (m: SstMember) => [
    m.name.toLowerCase(),
    m.fullName.toLowerCase(),
    ...(m.aliases ?? [])
  ];

  return (
    ALL_SST_MEMBERS.find((m) => candidates(m).includes(q)) ??
    ALL_SST_MEMBERS.find((m) => candidates(m).some((c) => q.includes(c))) ??
    null
  );
}

export function getSstBySlug(slug: string) {
  const s = slug.toLowerCase();
  return (
    ALL_SST_MEMBERS.find(
      (m) => m.slug === s || m.aliases?.includes(s)
    ) ?? null
  );
}
