export default function DashboardPage() {
  return (
    <div className="flex flex-col mx-auto max-w-2xl lg:max-w-full items-start justify-start min-h-screen">
      <h1 className="font-bold text-2xl mb-4">Dashboard</h1>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground">Active Students</p>
      </div>
    </div>
  );
}
