"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Eye } from "lucide-react";
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

const mockEvents: Event[] = [
  { id: "1", title: "Spring Hackathon", date: "2026-04-10", category: "tech", isPublished: true, viewCount: 342, societyName: "CS Society", rsvpCount: 87 },
  { id: "2", title: "Art Exhibition", date: "2026-04-15", category: "arts", isPublished: false, viewCount: 56, societyName: "Art Club", rsvpCount: 12 },
  { id: "3", title: "Career Fair", date: "2026-04-20", category: "career", isPublished: true, viewCount: 890, societyName: null, rsvpCount: 234 },
];

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
      setEvents(mockEvents);
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
        <span className="bg-surface-container-low text-on-surface-variant text-sm font-bold px-4 py-2 rounded-full">
          {events.length} total
        </span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">Title</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">Society</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">Date</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">Category</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">Status</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">Views</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4">RSVPs</th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-6 py-4 w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-on-surface">{event.title}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{event.societyName || "-"}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(event.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold uppercase tracking-wide bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-full capitalize">
                    {event.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${event.isPublished ? "bg-tertiary/10 text-tertiary" : "bg-surface-container-low text-on-surface-variant"}`}>
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
