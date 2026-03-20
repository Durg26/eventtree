"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, Loader2 } from "lucide-react";
import type { EventCategory } from "@/types";

const categories = [
  { value: "all", label: "All Events" },
  { value: "social", label: "Social" },
  { value: "academic", label: "Academic" },
  { value: "cultural", label: "Cultural" },
  { value: "sports", label: "Sports" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

interface EventResult {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  imageUrl: string | null;
  societyName: string;
  rsvpCount: number;
}

export default function EventsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-on-surface-variant" />
        </div>
      }
    >
      <EventsPage />
    </Suspense>
  );
}

function EventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  }

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== "all") params.set("category", category);
        if (debouncedSearch) params.set("search", debouncedSearch);

        const res = await fetch(`/api/events?${params}`);
        const data = await res.json();
        setEvents(data);
      } catch {
        setEvents([]);
      }
      setLoading(false);
    }
    fetchEvents();
  }, [category, debouncedSearch]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("search", search);
    router.push(`/events?${params}`);
  }

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1
          className="text-4xl font-extrabold text-on-surface mb-2"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Explore Events
        </h1>
        <p className="text-on-surface-variant text-lg">
          Find events that match your interests
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-5 mb-10">
        <form onSubmit={handleSearch} className="max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300"
            />
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={
                category === cat.value
                  ? "bg-primary text-white rounded-full font-semibold text-sm px-6 py-2.5 transition-all duration-300"
                  : "bg-surface-container-low border border-outline-variant/30 text-on-surface-variant rounded-full font-medium text-sm px-6 py-2.5 hover:border-primary/30 transition-all duration-300"
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {events.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-200 ${loading ? "opacity-50" : "opacity-100"}`}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={new Date(event.date)}
              location={event.location}
              category={event.category as EventCategory}
              societyName={event.societyName}
              imageUrl={event.imageUrl}
              rsvpCount={Number(event.rsvpCount)}
            />
          ))}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-on-surface-variant" />
        </div>
      ) : (
        <EmptyState
          title="No events found"
          description="Try a different search or category filter."
        />
      )}
    </div>
  );
}
