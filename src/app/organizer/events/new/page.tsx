"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const categories = [
  { value: "social", label: "Social" },
  { value: "academic", label: "Academic" },
  { value: "cultural", label: "Cultural" },
  { value: "sports", label: "Sports" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("social");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
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
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(isPublish ? "Event published!" : "Event saved as draft");
        router.push("/organizer/dashboard");
      } else {
        toast.error("Failed to create event");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <h1
        className="text-4xl font-extrabold text-on-surface tracking-tight mb-2"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Create Event
      </h1>
      <p className="text-on-surface-variant mt-2 text-lg mb-8">
        Fill in the details to set up your new event.
      </p>

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
              placeholder="Give your event a catchy name"
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
              placeholder="What's this event about? Include all the details students need to know."
              required
              minLength={10}
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
                required
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="text-sm font-medium text-on-surface mb-1.5 block"
              >
                End Date & Time (optional)
              </label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
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
              placeholder="e.g., Student Union Building, Room 303"
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
              Image URL (optional)
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://..."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm text-on-surface"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <button
              type="submit"
              data-action="publish"
              disabled={loading}
              className="bg-primary text-white rounded-xl font-semibold hover:bg-primary-dim transition-colors px-8 py-3.5 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Publish Event"}
            </button>
            <button
              type="submit"
              data-action="draft"
              disabled={loading}
              className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl font-semibold hover:border-primary/30 transition-colors px-8 py-3.5 disabled:opacity-50"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
