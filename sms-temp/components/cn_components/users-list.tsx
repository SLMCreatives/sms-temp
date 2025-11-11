"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Trash2 } from "lucide-react";
import type { CNUser } from "@/lib/cn-api-client";

export function UsersList() {
  const [users, setUsers] = useState<CNUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchUserId, setSearchUserId] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchEmail) params.append("email", searchEmail);
      if (searchUserId) params.append("user_id", searchUserId);

      const response = await fetch(`/cn/api/cn/users2?${params.toString()}`);
      const data = await response.json();

      if (data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      console.log("[v0] Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await fetch(`/cn/api/cn/users2/${id}`, {
        method: "DELETE"
      });
      fetchUsers();
    } catch (error) {
      console.error("[v0] Error deleting user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500",
      alumni: "bg-blue-500",
      parent: "bg-purple-500",
      external: "bg-yellow-500",
      drop_out: "bg-red-500",
      inactive: "bg-gray-500"
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Institution Users</CardTitle>
        <CardDescription>
          Manage and view all institution users from CN API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Search by user ID..."
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            className="flex-1"
          />
          <Button onClick={fetchUsers} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {user.first_name} {user.last_name}
                        </h3>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Email: {user.email}</p>
                        <p>CN Number: {user.cn_number}</p>
                        <p>User ID: {user.user_id}</p>
                        {user.login_id && <p>Login ID: {user.login_id}</p>}
                      </div>
                      {user.labels && user.labels.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {user.labels.map((label, idx) => (
                            <Badge key={idx} variant="outline">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {users.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-8">
                No users found. Try adjusting your search criteria.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
