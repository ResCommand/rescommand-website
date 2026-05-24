"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Plus, Pencil, Trash2, UserCircle } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-800",
  MANAGER: "bg-blue-100 text-blue-800",
  EMPLOYEE: "bg-green-100 text-green-800",
};

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("EMPLOYEE");
  const [formPhone, setFormPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreate() {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("EMPLOYEE");
    setFormPhone("");
    setDialogOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormPhone(user.phone || "");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingUser) {
        // Update
        const body: Record<string, unknown> = {
          id: editingUser.id,
          name: formName,
          email: formEmail,
          role: formRole,
          phone: formPhone || null,
        };
        if (formPassword) body.password = formPassword;

        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          toast.success(`${formName} updated`);
          setDialogOpen(false);
          loadUsers();
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to update user");
        }
      } else {
        // Create
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            password: formPassword,
            role: formRole,
            phone: formPhone || undefined,
          }),
        });

        if (res.ok) {
          toast.success(`${formName} created`);
          setDialogOpen(false);
          loadUsers();
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to create user");
        }
      }
    } catch {
      toast.error("Network error");
    }

    setSubmitting(false);
  }

  async function handleDelete(userId: number, userName: string) {
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`${userName} deactivated`);
        setDeleteConfirm(null);
        loadUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Network error");
    }
  }

  const isOwner = (session?.user as { role?: string })?.role === "OWNER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          User Management
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button onClick={openCreate} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-1" />
            Add User
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? `Edit ${editingUser.name}` : "Create New User"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="jane@duffers.com"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">
                  {editingUser ? "New Password (leave blank to keep)" : "Password *"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingUser ? "••••••••" : "Min 6 characters"}
                  required={!editingUser}
                  minLength={editingUser ? undefined : 6}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Role *</Label>
                <Select value={formRole} onValueChange={(v) => v !== null && setFormRole(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    {isOwner && <SelectItem value="OWNER">Owner</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 h-24" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className={user.active ? "" : "opacity-50"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        <Badge className={roleColors[user.role] || ""}>
                          {user.role}
                        </Badge>
                        {!user.active && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                        {user.phone && ` • ${user.phone}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(user)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    {isOwner && user.active && (
                      <>
                        {deleteConfirm === user.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(user.id, user.name)}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteConfirm(user.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {users.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}