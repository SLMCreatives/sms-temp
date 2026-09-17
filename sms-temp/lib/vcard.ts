/**
 * vCard 3.0 generation for saving student contacts to a phone.
 *
 * 3.0 rather than 4.0 on purpose — it is what iOS Contacts and Android import
 * most reliably.
 */

export type ContactStudent = {
  matric_no: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  programme_name?: string | null;
  campus_code?: string | null;
  intake_code?: string | null;
  study_mode?: string | null;
  /** Display name of the SST member who owns the student. */
  ownerName?: string | null;
};

/**
 * Normalises a Malaysian mobile number to E.164 so the phone dials and matches
 * WhatsApp correctly. Numbers in this data look like "010 - 265 7044" and
 * "012-2067925". Anything that doesn't fit a known shape is passed through
 * untouched rather than guessed at.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const hadPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7) return null;

  if (hadPlus) return `+${digits}`;
  if (digits.startsWith("60")) return `+${digits}`;
  // Local format: 0XX-XXXXXXX -> +60XX...
  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 11) {
    return `+60${digits.slice(1)}`;
  }
  // Unknown shape — keep what was entered so nothing is silently mangled.
  return trimmed;
}

/**
 * Names in this data are stored upper case ("MYREENA ANAK REARSON"), which
 * shouts in a phone's contact list. Title-cases while preserving the A/L and
 * A/P patronymic markers.
 */
export function titleCaseName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/[\p{L}']+/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1))
    .replace(/\bA\/L\b/gi, "A/L")
    .replace(/\bA\/P\b/gi, "A/P");
}

/** Escapes a vCard property value (RFC 6350 §3.4). */
function escapeValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Folds lines to 75 octets as the spec requires. Some Android importers reject
 * very long NOTE lines outright.
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 74) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) parts.push(" " + rest);
  return parts.join("\r\n");
}

/** One vCard. Returns null when there is nothing worth saving. */
export function studentToVCard(student: ContactStudent): string | null {
  const phone = normalizePhone(student.phone);
  const email = student.email?.trim() || null;
  if (!phone && !email) return null;

  const name = titleCaseName(student.full_name) || student.matric_no;

  const noteParts = [
    student.matric_no,
    student.programme_name || null,
    student.campus_code ? `Campus ${student.campus_code}` : null,
    student.intake_code ? `Intake ${student.intake_code}` : null,
    student.study_mode || null,
    student.ownerName ? `SST ${student.ownerName}` : null
  ].filter(Boolean);

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    // Whole name in the family slot so phones sort the list alphabetically by
    // the full string. Splitting Bin/Binti/A/L names into given/family is
    // unreliable, so it is deliberately not attempted.
    `N:${escapeValue(name)};;;;`,
    `FN:${escapeValue(name)}`
  ];

  if (phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${escapeValue(phone)}`);
  }
  if (email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeValue(email)}`);
  }

  lines.push(
    `ORG:${escapeValue("UNITAR International University")};${escapeValue("Student Success Team")}`
  );
  if (student.programme_name) {
    lines.push(`TITLE:${escapeValue(student.programme_name)}`);
  }
  if (noteParts.length) {
    lines.push(`NOTE:${escapeValue(noteParts.join(" · "))}`);
  }
  // Gives the team one searchable tag to find (or bulk delete) these later.
  const categories = ["SST Student", student.intake_code || null].filter(
    Boolean
  ) as string[];
  lines.push(`CATEGORIES:${categories.map(escapeValue).join(",")}`);
  lines.push("END:VCARD");

  return lines.map(foldLine).join("\r\n");
}

/** Concatenates many vCards into one importable file. */
export function buildVCardFile(students: ContactStudent[]): {
  body: string;
  included: number;
  skipped: number;
} {
  const cards: string[] = [];
  let skipped = 0;

  for (const student of students) {
    const card = studentToVCard(student);
    if (card) cards.push(card);
    else skipped += 1;
  }

  return {
    // Trailing CRLF matters: some importers drop the last card without it.
    body: cards.length ? cards.join("\r\n") + "\r\n" : "",
    included: cards.length,
    skipped
  };
}

/** Safe, descriptive download filename. */
export function vcardFilename(parts: (string | null | undefined)[]): string {
  const slug = parts
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "contacts"}.vcf`;
}
