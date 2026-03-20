"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SocietyProfileEditor() {
  const { data: session } = useSession();
  const user = session?.user as { societyId?: string } | undefined;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [society, setSociety] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.societyId) {
      fetch(`/api/societies/${user.societyId}`)
        .then((r) => r.json())
        .then((data) => {
          setSociety(data);
          setLoading(false);
        })
        .catch(() => {
          // Mock data fallback
          setSociety({
            name: "Demo Society",
            slug: "demo-society",
            description: "A sample society for preview purposes.",
            contactEmail: "hello@example.com",
          });
          setLoading(false);
        });
    } else {
      // No societyId yet, show empty form
      setLoading(false);
    }
  }, [user?.societyId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      logoUrl: form.get("logoUrl") || undefined,
      bannerUrl: form.get("bannerUrl") || undefined,
      contactEmail: form.get("contactEmail") || "",
      website: form.get("website") || undefined,
    };

    try {
      const res = await fetch(`/api/societies/${user?.societyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Profile updated!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-on-surface-variant" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1
        className="text-4xl font-extrabold text-on-surface tracking-tight mb-2"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Society Profile
      </h1>
      <p className="text-on-surface-variant mt-2 text-lg mb-8">
        Manage how your society appears to students.
      </p>

      <div className="bg-white rounded-2xl border border-outline-variant/30 p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Society Name */}
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-on-surface mb-1.5 block"
            >
              Society Name
            </label>
            <input
              id="name"
              name="name"
              defaultValue={society.name}
              required
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="text-sm font-medium text-on-surface mb-1.5 block"
            >
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={society.slug}
              required
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium text-on-surface mb-1.5 block"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={society.description}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface resize-y"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label
              htmlFor="logoUrl"
              className="text-sm font-medium text-on-surface mb-1.5 block"
            >
              Logo URL
            </label>
            <input
              id="logoUrl"
              name="logoUrl"
              defaultValue={society.logoUrl}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
            />
          </div>

          {/* Banner URL */}
          <div>
            <label
              htmlFor="bannerUrl"
              className="text-sm font-medium text-on-surface mb-1.5 block"
            >
              Banner URL
            </label>
            <input
              id="bannerUrl"
              name="bannerUrl"
              defaultValue={society.bannerUrl}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label
              htmlFor="contactEmail"
              className="text-sm font-medium text-on-surface mb-1.5 block"
            >
              Contact Email
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={society.contactEmail}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
            />
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="website"
              className="text-sm font-medium text-on-surface mb-1.5 block"
            >
              Website
            </label>
            <input
              id="website"
              name="website"
              defaultValue={society.website}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white rounded-xl font-semibold hover:bg-primary-dim transition-colors px-8 py-3.5 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
