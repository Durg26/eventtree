"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Eye, Plus, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Society {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
  createdAt: string;
  memberCount: number;
  eventCount: number;
}

const mockSocieties: Society[] = [
  { id: "1", name: "CS Society", slug: "cs-society", contactEmail: "cs@dal.ca", createdAt: "2025-09-01", memberCount: 120, eventCount: 15 },
  { id: "2", name: "Art Club", slug: "art-club", contactEmail: "art@dal.ca", createdAt: "2025-09-10", memberCount: 45, eventCount: 8 },
  { id: "3", name: "Debate Society", slug: "debate-society", contactEmail: null, createdAt: "2025-10-05", memberCount: 30, eventCount: 4 },
];

export default function AdminSocietiesPage() {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSocieties();
  }, []);

  async function fetchSocieties() {
    try {
      const res = await fetch("/api/admin/societies");
      const data = await res.json();
      setSocieties(data);
    } catch {
      setSocieties(mockSocieties);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/societies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          slug: form.get("slug"),
          description: form.get("description"),
          contactEmail: form.get("contactEmail") || "",
        }),
      });
      if (res.ok) {
        toast.success("Society created");
        setCreateOpen(false);
        fetchSocieties();
      } else {
        toast.error("Failed to create society");
      }
    } catch {
      toast.error("Failed to create society");
    }
    setSaving(false);
  }

  async function deleteSociety(id: string) {
    if (!confirm("Delete this society? This will also delete all its events.")) return;
    try {
      const res = await fetch(`/api/societies/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Society deleted");
        fetchSocieties();
      }
    } catch {
      toast.error("Failed to delete society");
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
          Manage Societies
        </h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-primary text-white rounded-xl font-semibold px-6 py-2.5 flex items-center gap-2 hover:bg-primary-dim transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Society
        </button>
      </div>

      {/* Create Dialog */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant/20 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-on-surface" style={{ fontFamily: "var(--font-headline)" }}>
                Create Society
              </h2>
              <button onClick={() => setCreateOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-on-surface-variant mb-2 block">Name</label>
                <input name="name" required className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant mb-2 block">Slug</label>
                <input name="slug" required placeholder="e.g., computer-science-society" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-colors placeholder:text-on-surface-variant/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant mb-2 block">Description</label>
                <input name="description" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant mb-2 block">Contact Email</label>
                <input name="contactEmail" type="email" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-colors" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dim transition-colors disabled:opacity-50">
                {saving ? "Creating..." : "Create Society"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Name</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Slug</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Contact</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Members</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Events</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Created</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4 w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {societies.map((s) => (
              <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors border-b border-outline-variant/10">
                <td className="px-6 py-4 text-sm font-semibold text-on-surface">{s.name}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{s.slug}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{s.contactEmail || "-"}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{Number(s.memberCount)}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{Number(s.eventCount)}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/societies/${s.id}`} className="text-primary hover:text-primary-dim transition-colors">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button onClick={() => deleteSociety(s.id)} className="text-error hover:text-error-dim transition-colors">
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
