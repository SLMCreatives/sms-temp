import { UsersList } from "@/components/cn_components/users-list";
import { CreateUserForm } from "@/components/cn_components/create-user-form";
import { EnrollmentsList } from "@/components/cn_components/enrollments-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">CN API Dashboard</h1>
          <p className="text-muted-foreground">
            Manage institution users and course enrollments via The CN API
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="create">Create User</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersList />
          </TabsContent>

          <TabsContent value="create">
            <CreateUserForm />
          </TabsContent>

          <TabsContent value="enrollments">
            <EnrollmentsList />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
