import { notFound } from "next/navigation";
import Link from "next/link";
import { RsvpButton } from "@/components/events/rsvp-button";
import { CalendarDays, MapPin, Eye, ArrowLeft, Clock, Users, Sparkles } from "lucide-react";
import type { EventCategory } from "@/types";

export const dynamic = "force-dynamic";

async function getEventData(eventId: string) {
  try {
    const { db } = await import("@/db");
    const { events, societies, rsvps } = await import("@/db/schema");
    const { eq, and, sql } = await import("drizzle-orm");

    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        date: events.date,
        endDate: events.endDate,
        category: events.category,
        imageUrl: events.imageUrl,
        isPublished: events.isPublished,
        viewCount: events.viewCount,
        societyId: events.societyId,
        societyName: societies.name,
        societySlug: societies.slug,
        societyLogo: societies.logoUrl,
        societyDescription: societies.description,
        createdAt: events.createdAt,
        rsvpCount: sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'going')`,
        interestedCount: sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'interested')`,
      })
      .from(events)
      .innerJoin(societies, eq(events.societyId, societies.id))
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) return null;

    // Increment view count
    await db.update(events).set({ viewCount: sql`${events.viewCount} + 1` }).where(eq(events.id, eventId));

    // Check user RSVP status
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    let userRsvpStatus: "going" | "interested" | null = null;
    if (session?.user) {
      const [existingRsvp] = await db
        .select()
        .from(rsvps)
        .where(and(eq(rsvps.userId, session.user.id!), eq(rsvps.eventId, eventId)))
        .limit(1);
      if (existingRsvp) {
        userRsvpStatus = existingRsvp.status as "going" | "interested";
      }
    }

    return { event, userRsvpStatus };
  } catch {
    return {
      event: {
        id: eventId,
        title: "The Autumn Equinox Gala: A Night of Student Expression",
        description: "Join us for an unforgettable evening celebrating student creativity and community. This annual gala brings together performers, artists, and students from across campus for a night of live music, spoken word, visual art installations, and dancing.\n\nThe evening will feature:\n- Live performances from student bands and solo artists\n- A curated gallery of student artwork\n- Spoken word and poetry open mic\n- Catered refreshments and appetizers\n- Photo booth with props\n- Networking with student leaders and faculty\n\nDress code is semi-formal. All students are welcome regardless of society membership. This is a wonderful opportunity to connect with fellow students and celebrate the vibrant creative culture on campus.",
        location: "Student Union Building, McInnes Room",
        date: new Date("2026-04-05T19:00:00"),
        endDate: new Date("2026-04-05T23:00:00"),
        category: "social",
        imageUrl: null,
        isPublished: true,
        viewCount: 342,
        societyId: "mock-society-1",
        societyName: "Dalhousie Arts Society",
        societySlug: "dal-arts",
        societyLogo: null,
        societyDescription: "Fostering creativity and artistic expression across campus since 1998.",
        createdAt: new Date("2026-03-01"),
        rsvpCount: 142,
        interestedCount: 67,
      },
      userRsvpStatus: null as "going" | "interested" | null,
    };
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  const data = await getEventData(eventId);
  if (!data) notFound();

  const { event, userRsvpStatus } = data;

  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTimeStr = event.endDate
    ? new Date(event.endDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : null;

  const categoryLabels: Record<string, string> = {
    social: "Social & Mixers",
    academic: "Academic Labs",
    cultural: "Cultural",
    sports: "Outdoor & Wellness",
    workshop: "Career Pathways",
    other: "Discovery",
  };

  const tags = [
    categoryLabels[event.category as string] || event.category,
    "Open to All",
    "Free Entry",
  ];

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      {/* Back Navigation */}
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-8 group"
      >
        <span className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary-container/20 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold tracking-wide">Back to events</span>
      </Link>

      {/* Hero Image */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-amber-900/10 mb-12">
        <div className="aspect-[21/9]">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-container/40 via-primary/20 to-tertiary/10 flex items-center justify-center">
              <CalendarDays className="h-24 w-24 text-primary/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-tertiary-container text-on-tertiary-container text-xs font-bold tracking-wider rounded-full uppercase px-3 py-1">
              {categoryLabels[event.category as string] || event.category}
            </span>
            <span className="bg-white/90 backdrop-blur text-stone-900 text-xs font-bold tracking-wider rounded-full px-3 py-1">
              {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          <h1
            className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight max-w-3xl"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {event.title}
          </h1>
          <p className="text-amber-400 font-bold uppercase tracking-widest text-sm" style={{ fontFamily: 'var(--font-headline)' }}>
            {event.societyName}
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-10">
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">{event.viewCount} views</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{Number(event.rsvpCount)} going</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{Number(event.interestedCount)} interested</span>
            </div>
          </div>

          {/* About Section */}
          <section>
            <div className="mb-6">
              <h2
                className="text-2xl font-bold text-on-surface mb-2"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                About this event
              </h2>
              <div className="w-8 h-1 bg-primary rounded-full" />
            </div>
            <div className="whitespace-pre-wrap text-on-surface-variant leading-relaxed text-base">
              {event.description}
            </div>
          </section>

          {/* Tags */}
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-white text-stone-700 rounded-full text-xs font-semibold shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* RSVP Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm shadow-amber-900/5">
            <h3
              className="text-2xl font-bold text-on-surface mb-2"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Are you going?
            </h3>
            <div className="w-8 h-1 bg-primary rounded-full mb-6" />
            <RsvpButton
              eventId={event.id}
              currentStatus={userRsvpStatus}
              rsvpCount={Number(event.rsvpCount)}
            />
            <p className="text-xs font-medium text-on-surface-variant mt-3">
              {Number(event.interestedCount)} people interested
            </p>
          </div>

          {/* Event Details Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm shadow-amber-900/5">
            <h3
              className="text-2xl font-bold text-on-surface mb-2"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Event details
            </h3>
            <div className="w-8 h-1 bg-primary rounded-full mb-6" />

            <div className="space-y-6">
              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Date</p>
                  <p className="font-bold text-on-surface" style={{ fontFamily: 'var(--font-headline)' }}>
                    {dateStr}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Time</p>
                  <p className="font-bold text-on-surface" style={{ fontFamily: 'var(--font-headline)' }}>
                    {timeStr}{endTimeStr ? ` - ${endTimeStr}` : ""}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Location</p>
                  <p className="font-bold text-on-surface" style={{ fontFamily: 'var(--font-headline)' }}>
                    {event.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Society Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm shadow-amber-900/5">
            <h3
              className="text-2xl font-bold text-on-surface mb-2"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Hosted by
            </h3>
            <div className="w-8 h-1 bg-primary rounded-full mb-6" />
            <Link href={`/societies/${event.societyId}`} className="group block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg" style={{ fontFamily: 'var(--font-headline)' }}>
                    {event.societyName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-on-surface group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-headline)' }}>
                    {event.societyName}
                  </p>
                  {event.societyDescription && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                      {event.societyDescription}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform w-full" style={{ fontFamily: 'var(--font-headline)' }}>
              Secure Your Spot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
