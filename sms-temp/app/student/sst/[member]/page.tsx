import { notFound } from "next/navigation";

import { getData } from "../../getData";
import { getViewer } from "../../get-viewer";
import StudentWorkspace from "../../student-workspace";
import { getSstBySlug, SST_MEMBERS } from "@/lib/sst-members";

export const dynamic = "force-dynamic";
export const revalidate = 600;

export function generateStaticParams() {
  return SST_MEMBERS.map((m) => ({ member: m.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ member: string }>;
}) {
  const { member } = await params;
  const sst = getSstBySlug(member);
  return { title: sst ? `${sst.name} — Students` : "Students" };
}

export default async function SstStudentsPage({
  params
}: {
  params: Promise<{ member: string }>;
}) {
  const { member } = await params;
  const sst = getSstBySlug(member);
  if (!sst) notFound();

  const [data, viewer] = await Promise.all([getData(), getViewer()]);

  return (
    <StudentWorkspace
      data={data}
      currentSst={viewer.sst}
      isManager={viewer.isManager}
      lockedSst={sst}
      title={`${sst.name}'s students`}
      subtitle="Students assigned to this SST member"
    />
  );
}
