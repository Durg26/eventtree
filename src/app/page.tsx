import Link from "next/link";
import { EventCard } from "@/components/events/event-card";
import type { EventCategory } from "@/types";
import { Calendar, Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getEvents() {
  try {
    const { db } = await import("@/db");
    const { events, societies } = await import("@/db/schema");
    const { eq, and, gte, sql } = await import("drizzle-orm");
    return await db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        location: events.location,
        category: events.category,
        imageUrl: events.imageUrl,
        societyName: societies.name,
        rsvpCount: sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'going')`,
      })
      .from(events)
      .innerJoin(societies, eq(events.societyId, societies.id))
      .where(and(eq(events.isPublished, true), gte(events.date, new Date())))
      .orderBy(events.date)
      .limit(8);
  } catch {
    return [
      { id: "1", title: "The Autumn Equinox Gala: A Night of Student Expression", date: new Date("2026-04-05"), location: "Student Union Building", category: "social", imageUrl: null, societyName: "Dalhousie Arts Society", rsvpCount: 142 },
      { id: "2", title: "Late Night Bio-Chem Study Intensive", date: new Date("2026-04-12"), location: "Killam Memorial Library, Room 402", category: "academic", imageUrl: null, societyName: "Pre-Med Collective", rsvpCount: 28 },
      { id: "3", title: "Tech Connect: Networking with Local Startups", date: new Date("2026-04-18"), location: "SUB Ballroom", category: "workshop", imageUrl: null, societyName: "Engineering Students' Council", rsvpCount: 65 },
      { id: "4", title: "Weekly General Assembly & Scrimmage", date: new Date("2026-04-20"), location: "Rowe Building, B101", category: "academic", imageUrl: null, societyName: "Dalhousie Debate Union", rsvpCount: 30 },
      { id: "5", title: "Point Pleasant Morning Yoga & Coffee", date: new Date("2026-04-22"), location: "Point Pleasant Park", category: "sports", imageUrl: null, societyName: "Outdoor Adventure Club", rsvpCount: 18 },
      { id: "6", title: "Cultural Night: A World of Flavors", date: new Date("2026-04-25"), location: "McInnes Room", category: "cultural", imageUrl: null, societyName: "International Society", rsvpCount: 95 },
    ];
  }
}

export default async function HomePage() {
  const upcomingEvents = await getEvents();

  return (
    <div className="min-h-screen">
      {/* Hero — Pastel gradient like evtree.info */}
      <section className="relative gradient-mesh pt-32 pb-24 px-6 overflow-hidden">
        {/* Floating blur circles for depth */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl pointer-events-none blur-orb" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl pointer-events-none blur-orb" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-200/15 rounded-full blur-3xl pointer-events-none blur-orb" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1
            className="text-5xl md:text-7xl font-extrabold text-on-surface tracking-tight leading-[1.1] mb-6"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            One stop shop for all your<br />university events
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12">
            Discover societies, explore events, and stay connected with everything happening on campus.
          </p>

          {/* Two CTA cards — matching evtree.info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              href="/events"
              className="group bg-white rounded-2xl border border-outline-variant/30 p-8 text-left card-hover hover:border-primary/30"
            >
              <Calendar className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-on-surface mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Explore Events
              </h3>
              <p className="text-on-surface-variant text-sm mb-4">
                Browse the latest events, from workshops to social gatherings, and find what interests you.
              </p>
              <span className="text-primary font-semibold text-sm group-hover:underline">
                View all events →
              </span>
            </Link>

            <Link
              href="/community"
              className="group bg-white rounded-2xl border border-outline-variant/30 p-8 text-left card-hover hover:border-primary/30"
            >
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-on-surface mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Discover Societies
              </h3>
              <p className="text-on-surface-variant text-sm mb-4">
                Find and connect with student societies across all departments and interests.
              </p>
              <span className="text-primary font-semibold text-sm group-hover:underline">
                Browse societies →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-on-surface tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
              Upcoming Events
            </h2>
            <p className="text-on-surface-variant mt-1">Don&apos;t miss what&apos;s happening next</p>
          </div>
          <Link
            href="/events"
            className="text-primary font-semibold text-sm hover:underline hidden md:block"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={event.date}
              location={event.location}
              category={event.category as EventCategory}
              societyName={event.societyName}
              imageUrl={event.imageUrl}
              rsvpCount={Number(event.rsvpCount)}
            />
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link
            href="/events"
            className="text-primary font-semibold text-sm hover:underline"
          >
            View all events →
          </Link>
        </div>
      </section>
    </div>
  );
}
