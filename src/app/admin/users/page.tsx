"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Edit, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  societyId: string | null;
  createdAt: string;
}

const mockUsers: UserRecord[] = [
  { id: "1", name: "Alice Johnson", email: "alice@dal.ca", role: "student", societyId: null, createdAt: "2025-09-01" },
  { id: "2", name: "Bob Smith", email: "bob@dal.ca", role: "organizer", societyId: "s1", createdAt: "2025-10-15" },
  { id: "3", name: "Carol Admin", email: "carol@dal.ca", role: "admin", societyId: null, createdAt: "2025-08-20" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          role: form.get("role"),
        }),
      });
      if (res.ok) {
        toast.success("User created");
        setCreateOpen(false);
        fetchUsers();
      } else {
        toast.error("Failed to create user");
      }
    } catch {
      toast.error("Failed to create user");
    }
    setSaving(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      const form = new FormData(e.currentTarget);
      const body: Record<string, string | null> = {
        id: editUser.id,
        name: form.get("name") as string,
        email: form.get("email") as string,
        role: form.get("role") as string,
      };
      const pw = form.get("password") as string;
      if (pw) body.password = pw;

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("User updated");
        setEditUser(null);
        fetchUsers();
      }
    } catch {
      toast.error("Failed to update user");
    }
    setSaving(false);
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("User deleted");
        fetchUsers();
      }
    } catch {
      toast.error("Failed to delete user");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-outline" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-4xl font-extrabold text-on-background tracking-tight"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Manage Users
        </h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-primary text-on-primary rounded-full font-bold px-6 py-2 flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Create Dialog */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: "var(--font-headline)" }}>
                Create User
              </h2>
              <button onClick={() => setCreateOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-on-surface-variant mb-2 block">Name</label>
                <input name="name" required className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant mb-2 block">Email</label>
                <input name="email" type="email" required className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant mb-2 block">Password</label>
                <input name="password" type="password" required minLength={6} className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant mb-2 block">Role</label>
                <select name="role" defaultValue="student" className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="student">Student</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-primary text-on-primary py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50">
                {saving ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: "var(--font-headline)" }}>
                Edit User
              </h2>
              <button onClick={() => setEditUser(null)} className="text-on-surface-variant hover:text-on-surface">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-on-surface-variant mb-2 block">Name</label>
                <input name="name" defaultValue={editUser.name} required className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant mb-2 block">Email</label>
                <input name="email" type="email" defaultValue={editUser.email} required className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant mb-2 block">New Password (leave blank to keep)</label>
                <input name="password" type="password" className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant mb-2 block">Role</label>
                <select name="role" defaultValue={editUser.role} className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="student">Student</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-primary text-on-primary py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">Name</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">Email</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">Role</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">Joined</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4 w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-on-surface">{u.name}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold uppercase tracking-wide bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-full capitalize">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditUser(u)} className="text-primary hover:text-primary-dim transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteUser(u.id)} className="text-error hover:text-error-dim transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
