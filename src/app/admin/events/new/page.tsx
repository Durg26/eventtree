"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, ExternalLink } from "lucide-react";

interface Society {
  id: string;
  name: string;
}

const CATEGORIES = [
  { value: "social", label: "Social" },
  { value: "academic", label: "Academic" },
  { value: "cultural", label: "Cultural" },
  { value: "sports", label: "Sports" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

function buildGoogleCalendarUrl(event: {
  title: string;
  description: string;
  location: string;
  date: string;
  endDate: string;
}) {
  const fmt = (d: string) =>
    new Date(d).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const start = fmt(event.date);
  const end = event.endDate ? fmt(event.endDate) : fmt(new Date(new Date(event.date).getTime() + 2 * 3600000).toISOString());
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export default function AdminCreateEventPage() {
  const router = useRouter();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<{
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    endDate: string;
  } | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    endDate: "",
    category: "social",
    imageUrl: "",
    societyId: "",
    isPublished: true,
  });

  useEffect(() => {
    fetch("/api/admin/societies")
      .then((r) => r.json())
      .then((data) => {
        setSocieties(data);
        if (data.length > 0) setForm((f) => ({ ...f, societyId: data[0].id }));
      })
      .catch(() => toast.error("Failed to load societies"));
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.societyId) {
      toast.error("Please select a society");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl: form.imageUrl.trim() || undefined,
          endDate: form.endDate || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("Event created!");
        setCreatedEvent({
          id: data.id,
          title: form.title,
          description: form.description,
          location: form.location,
          date: form.date,
          endDate: form.endDate,
        });
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create event");
      }
    } catch {
      toast.error("Failed to create event");
    }
    setSubmitting(false);
  }

  if (createdEvent) {
    const gcalUrl = buildGoogleCalendarUrl(createdEvent);
    return (
      <div className="max-w-xl">
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <h2
            className="text-2xl font-extrabold text-on-surface mb-2"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Event Created!
          </h2>
          <p className="text-on-surface-variant mb-6">
            <span className="font-semibold text-on-surface">{createdEvent.title}</span> has been added to the platform.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dim transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Add to Google Calendar
            </a>
            <button
              onClick={() => router.push(`/events/${createdEvent.id}`)}
              className="px-6 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl font-semibold hover:border-primary/30 transition-colors"
            >
              View Event
            </button>
            <button
              onClick={() => {
                setCreatedEvent(null);
                setForm({
                  title: "",
                  description: "",
                  location: "",
                  date: "",
                  endDate: "",
                  category: "social",
                  imageUrl: "",
                  societyId: societies[0]?.id || "",
                  isPublished: true,
                });
              }}
              className="px-6 py-3 text-on-surface-variant hover:text-on-surface text-sm font-semibold transition-colors"
            >
              Create another event
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-4xl font-extrabold text-on-background tracking-tight"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Create Event
        </h1>
        <p className="text-on-surface-variant mt-1">Add an event to any society on the platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Society */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Society <span className="text-error">*</span>
          </label>
          <select
            name="societyId"
            value={form.societyId}
            onChange={handleChange}
            required
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
          >
            {societies.length === 0 && (
              <option value="">Loading societies...</option>
            )}
            {societies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Event Title <span className="text-error">*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            minLength={3}
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Spring Networking Night"
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Description <span className="text-error">*</span>
          </label>
          <textarea
            name="description"
            required
            minLength={10}
            rows={5}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the event, what to expect, who should attend..."
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none resize-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Location <span className="text-error">*</span>
          </label>
          <input
            name="location"
            type="text"
            required
            value={form.location}
            onChange={handleChange}
            placeholder="e.g., Student Union Building, Room 302"
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
          />
        </div>

        {/* Date / End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Start Date & Time <span className="text-error">*</span>
            </label>
            <input
              name="date"
              type="datetime-local"
              required
              value={form.date}
              onChange={handleChange}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              End Date & Time <span className="text-on-surface-variant font-normal">(optional)</span>
            </label>
            <input
              name="endDate"
              type="datetime-local"
              value={form.endDate}
              onChange={handleChange}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Category <span className="text-error">*</span>
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Poster Image URL */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Poster / Image URL <span className="text-on-surface-variant font-normal">(optional)</span>
          </label>
          <input
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/poster.jpg"
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Poster preview"
              className="mt-3 rounded-xl max-h-48 object-cover border border-outline-variant/30"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>

        {/* Publish status */}
        <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant/30">
          <input
            id="isPublished"
            name="isPublished"
            type="checkbox"
            checked={form.isPublished}
            onChange={handleChange}
            className="h-4 w-4 accent-primary"
          />
          <label htmlFor="isPublished" className="text-sm font-semibold text-on-surface cursor-pointer">
            Publish immediately
          </label>
          <span className="text-xs text-on-surface-variant ml-auto">
            {form.isPublished ? "Visible to students" : "Saved as draft"}
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dim transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Event"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/events")}
            className="px-8 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl font-semibold hover:border-primary/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
