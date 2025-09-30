import { LMSActivityManager } from "@/components/lms-activity-manager";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              LMS Activity Manager
            </h1>
            <p className="text-muted-foreground">
              Upload and update student activity records in the LMS system
            </p>
          </div>
          <LMSActivityManager />
        </div>
      </div>
    </main>
  );
}
