// app/students/[matric_no]/page.tsx
export default function StudentPage({
  params
}: {
  params: { matric_no: string };
}) {
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Dynamic Student Page</h1>
      <p>matric_no: {params.matric_no}</p>
    </main>
  );
}
