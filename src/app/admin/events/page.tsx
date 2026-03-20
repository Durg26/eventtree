"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  date: string;
  category: string;
  isPublished: boolean;
  viewCount: number;
  societyName: string | null;
  rsvpCount: number;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Event deleted");
        fetchEvents();
      }
    } catch {
      toast.error("Failed to delete event");
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
          Manage Events
        </h1>
        <div className="flex items-center gap-3">
          <span className="bg-white text-on-surface-variant text-sm font-semibold px-4 py-2 rounded-xl border border-outline-variant/30">
            {events.length} total
          </span>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary-dim transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Title</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Society</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Date</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Category</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Status</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">Views</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4">RSVPs</th>
              <th className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4 w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-surface-container-low/50 transition-colors border-b border-outline-variant/10">
                <td className="px-6 py-4 text-sm font-semibold text-on-surface">{event.title}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{event.societyName || "-"}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(event.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium uppercase tracking-wide bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-full capitalize">
                    {event.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${event.isPublished ? "bg-primary/10 text-primary" : "bg-surface-container-low text-on-surface-variant"}`}>
                    {event.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{event.viewCount}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{Number(event.rsvpCount)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/events/${event.id}`} className="text-primary hover:text-primary-dim transition-colors">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button onClick={() => deleteEvent(event.id)} className="text-error hover:text-error-dim transition-colors">
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
