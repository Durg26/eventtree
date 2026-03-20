"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { value: "social", label: "Social" },
  { value: "academic", label: "Academic" },
  { value: "cultural", label: "Cultural" },
  { value: "sports", label: "Sports" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Record<string, string | boolean>>({});
  const [category, setCategory] = useState("social");

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json())
      .then((data) => {
        setEvent(data);
        setCategory(data.category || "social");
        setLoading(false);
      })
      .catch(() => {
        // Mock data fallback
        setEvent({
          title: "Sample Event",
          description: "This is a sample event for preview.",
          location: "Main Hall",
          date: new Date().toISOString(),
          category: "social",
          isPublished: false,
        });
        setCategory("social");
        setLoading(false);
      });
  }, [eventId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const isPublish =
      (e.nativeEvent as SubmitEvent).submitter?.getAttribute("data-action") === "publish";

    const body = {
      title: form.get("title"),
      description: form.get("description"),
      location: form.get("location"),
      date: form.get("date"),
      endDate: form.get("endDate") || undefined,
      category,
      imageUrl: form.get("imageUrl") || undefined,
      isPublished: isPublish,
    };

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Event updated!");
        router.push("/organizer/dashboard");
      } else {
        toast.error("Failed to update event");
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

  const dateValue = event.date ? new Date(event.date as string).toISOString().slice(0, 16) : "";
  const endDateValue = event.endDate
    ? new Date(event.endDate as string).toISOString().slice(0, 16)
    : "";

  return (
    <div className="max-w-2xl">
      <h1
        className="text-4xl font-extrabold text-on-surface tracking-tight mb-2"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Edit Event
      </h1>
      <p className="text-on-surface-variant mt-2 text-lg mb-8">Update your event details below.</p>

      <div className="bg-white rounded-2xl border border-outline-variant/30 p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="text-sm font-medium text-on-surface mb-1.5 block"
            >
              Event Title
            </label>
            <input
              id="title"
              name="title"
              defaultValue={event.title as string}
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
              rows={5}
              defaultValue={event.description as string}
              required
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface resize-y"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="text-sm font-medium text-on-surface mb-1.5 block"
              >
                Start Date & Time
              </label>
              <input
                id="date"
                name="date"
                type="datetime-local"
                defaultValue={dateValue}
                required
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="text-sm font-medium text-on-surface mb-1.5 block"
              >
                End Date & Time
              </label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                defaultValue={endDateValue}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="text-sm font-medium text-on-surface mb-1.5 block"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              defaultValue={event.location as string}
              required
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-on-surface mb-1.5 block">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    category === cat.value
                      ? "bg-primary text-white"
                      : "bg-surface-container-low border border-outline-variant/30 text-on-surface hover:border-primary/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label
              htmlFor="imageUrl"
              className="text-sm font-medium text-on-surface mb-1.5 block"
            >
              Image URL
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              defaultValue={event.imageUrl as string}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <button
              type="submit"
              data-action="publish"
              disabled={saving}
              className="bg-primary text-white rounded-xl font-semibold hover:bg-primary-dim transition-colors px-8 py-3.5 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Publish"}
            </button>
            <button
              type="submit"
              data-action="draft"
              disabled={saving}
              className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl font-semibold hover:border-primary/30 transition-colors px-8 py-3.5 disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-on-surface-variant hover:text-on-surface px-8 py-3.5 rounded-xl font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
