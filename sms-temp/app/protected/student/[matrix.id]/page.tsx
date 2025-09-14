export default async function Page({
  params
}: {
  params: Promise<{ matrix: { id: string } }>;
}) {
  const { matrix } = await params;
  return <div>My Post: {matrix.id}</div>;
}
