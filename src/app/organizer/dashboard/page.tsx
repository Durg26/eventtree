import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events, societies } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { CalendarDays, Eye, Users, Plus, Edit, TrendingUp, Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrganizerDashboard() {
  const session = await auth();
  const user = session?.user as { id: string; societyId: string | null } | undefined;
  if (!user?.societyId) redirect("/");

  let society: { name: string } | undefined;
  let myEvents: {
    id: string;
    title: string;
    date: Date | string;
    category: string;
    isPublished: boolean;
    viewCount: number;
    rsvpCount: number;
    interestedCount: number;
  }[] = [];

  try {
    const [societyRow] = await db
      .select()
      .from(societies)
      .where(eq(societies.id, user.societyId))
      .limit(1);
    society = societyRow;

    myEvents = await db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        category: events.category,
        isPublished: events.isPublished,
        viewCount: events.viewCount,
        rsvpCount:
          sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'going')`,
        interestedCount:
          sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'interested')`,
      })
      .from(events)
      .where(eq(events.societyId, user.societyId))
      .orderBy(events.date);
  } catch {
    // Mock data fallback
    society = { name: "Demo Society" };
    myEvents = [
      {
        id: "mock-1",
        title: "Welcome Mixer",
        date: new Date().toISOString(),
        category: "social",
        isPublished: true,
        viewCount: 142,
        rsvpCount: 38,
        interestedCount: 12,
      },
      {
        id: "mock-2",
        title: "Workshop: Intro to Design",
        date: new Date(Date.now() + 86400000 * 3).toISOString(),
        category: "workshop",
        isPublished: false,
        viewCount: 27,
        rsvpCount: 9,
        interestedCount: 5,
      },
    ];
  }

  const totalViews = myEvents.reduce((sum, e) => sum + e.viewCount, 0);
  const totalRsvps = myEvents.reduce((sum, e) => sum + Number(e.rsvpCount), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1
            className="text-4xl font-extrabold text-on-surface tracking-tight"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Dashboard
          </h1>
          <p className="text-on-surface-variant mt-2 text-lg">{society?.name || "Your Society"}</p>
        </div>
        <Link
          href="/organizer/events/new"
          className="bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-dim transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          Create Event
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <CalendarDays className="h-5 w-5" />
            </div>
            <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Active
            </span>
          </div>
          <p
            className="text-3xl font-extrabold text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {myEvents.length}
          </p>
          <p className="text-on-surface-variant text-sm mt-1">Total Events</p>
        </div>

        <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> RSVPs
            </span>
          </div>
          <p
            className="text-3xl font-extrabold text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {totalRsvps}
          </p>
          <p className="text-on-surface-variant text-sm mt-1">Total RSVPs</p>
        </div>

        <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Eye className="h-5 w-5" />
            </div>
            <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Views
            </span>
          </div>
          <p
            className="text-3xl font-extrabold text-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {totalViews}
          </p>
          <p className="text-on-surface-variant text-sm mt-1">Total Views</p>
        </div>
      </div>

      {/* Tip Card */}
      <div className="bg-violet-50 rounded-2xl border border-outline-variant/30 p-6 mb-10 flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <p className="text-on-surface font-semibold text-sm">Pro tip</p>
          <p className="text-on-surface-variant text-sm mt-1">
            Events with images get 3x more views. Add a cover image to boost engagement!
          </p>
          <Link
            href="/organizer/events/new"
            className="text-primary font-bold text-sm mt-2 inline-block hover:underline"
          >
            Create an event with an image &rarr;
          </Link>
        </div>
      </div>

      {/* Events List */}
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Your Events
        </h2>
        <div className="flex gap-2">
          <span className="bg-primary/10 px-4 py-2 rounded-full text-primary text-xs font-bold">
            All
          </span>
        </div>
      </div>

      {myEvents.length > 0 ? (
        <div className="space-y-4">
          {myEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-outline-variant/30 p-4 flex flex-col lg:flex-row gap-6 items-center hover:shadow-lg transition-all duration-300"
            >
              {/* Thumbnail placeholder */}
              <div className="w-full lg:w-48 h-32 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarDays className="h-8 w-8 text-primary/40" />
              </div>

              {/* Event info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                    {event.category}
                  </span>
                  {!event.isPublished && (
                    <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase bg-surface-container-high px-2 py-0.5 rounded">
                      Draft
                    </span>
                  )}
                </div>
                <h3
                  className="text-lg font-bold text-on-surface truncate"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {event.title}
                </h3>
                <p className="text-on-surface-variant text-sm mt-1">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-center">
                  <p className="text-lg font-bold text-on-surface">{event.viewCount}</p>
                  <p className="text-on-surface-variant text-xs">Views</p>
                </div>
                <div className="border-l border-outline-variant/30 h-8" />
                <div className="text-center">
                  <p className="text-lg font-bold text-on-surface">{Number(event.rsvpCount)}</p>
                  <p className="text-on-surface-variant text-xs">Going</p>
                </div>
                <div className="border-l border-outline-variant/30 h-8" />
                <div className="text-center">
                  <p className="text-lg font-bold text-on-surface">
                    {Number(event.interestedCount)}
                  </p>
                  <p className="text-on-surface-variant text-xs">Interested</p>
                </div>
              </div>

              {/* Edit button */}
              <Link
                href={`/organizer/events/${event.id}/edit`}
                className="p-3 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
              >
                <Edit className="h-5 w-5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-16 text-center">
          <div className="p-4 bg-primary/10 text-primary rounded-full inline-flex mb-4">
            <CalendarDays className="h-8 w-8" />
          </div>
          <h3
            className="text-xl font-bold text-on-surface mb-2"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            No events yet
          </h3>
          <p className="text-on-surface-variant mb-6">Create your first event to get started!</p>
          <Link
            href="/organizer/events/new"
            className="bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-dim transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Event
          </Link>
        </div>
      )}
    </div>
  );
}
