"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    status: "active",
    user_id: "",
    login_id: "",
    labels: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        labels: formData.labels
          ? formData.labels.split(",").map((l) => l.trim())
          : []
      };

      const response = await fetch("/cn/api/cn/users2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.data) {
        alert("User created successfully!");
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          status: "active",
          user_id: "",
          login_id: "",
          labels: ""
        });
        onSuccess?.();
      } else if (data.errs) {
        alert(`Error: ${JSON.stringify(data.errs)}`);
      }
    } catch (error) {
      console.error("[v0] Error creating user:", error);
      alert("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
        <CardDescription>Import a new institution user to CN</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                required
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_id">User ID *</Label>
            <Input
              id="user_id"
              required
              value={formData.user_id}
              onChange={(e) =>
                setFormData({ ...formData, user_id: e.target.value })
              }
              placeholder="Primary key in your system"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="drop_out">Drop Out</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login_id">Login ID (Optional)</Label>
            <Input
              id="login_id"
              value={formData.login_id}
              onChange={(e) =>
                setFormData({ ...formData, login_id: e.target.value })
              }
              placeholder="For custom login only"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="labels">Labels (Optional)</Label>
            <Input
              id="labels"
              value={formData.labels}
              onChange={(e) =>
                setFormData({ ...formData, labels: e.target.value })
              }
              placeholder="Comma-separated labels"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create User"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
