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
        className="text-4xl font-extrabold text-on-background tracking-tight mb-2"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Create Event
      </h1>
      <p className="text-secondary mt-2 text-lg mb-8">
        Fill in the details to set up your new event.
      </p>

      <div className="bg-surface-container-low p-8 rounded-2xl">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-xs font-bold tracking-[0.05em] uppercase text-outline"
            >
              Event Title
            </label>
            <input
              id="title"
              name="title"
              placeholder="Give your event a catchy name"
              required
              className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-xs font-bold tracking-[0.05em] uppercase text-outline"
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
              className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none resize-y"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="date"
                className="text-xs font-bold tracking-[0.05em] uppercase text-outline"
              >
                Start Date & Time
              </label>
              <input
                id="date"
                name="date"
                type="datetime-local"
                required
                className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="endDate"
                className="text-xs font-bold tracking-[0.05em] uppercase text-outline"
              >
                End Date & Time (optional)
              </label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label
              htmlFor="location"
              className="text-xs font-bold tracking-[0.05em] uppercase text-outline"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              placeholder="e.g., Student Union Building, Room 303"
              required
              className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-[0.05em] uppercase text-outline">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    category === cat.value
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container-high text-secondary hover:bg-surface-container-highest"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label
              htmlFor="imageUrl"
              className="text-xs font-bold tracking-[0.05em] uppercase text-outline"
            >
              Image URL (optional)
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://..."
              className="w-full bg-surface-container-high border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <button
              type="submit"
              data-action="publish"
              disabled={loading}
              className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "Saving..." : "Publish Event"}
            </button>
            <button
              type="submit"
              data-action="draft"
              disabled={loading}
              className="bg-surface-container-high text-secondary px-8 py-4 rounded-full font-bold hover:bg-surface-container-highest transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
