import { notFound } from "next/navigation";
import { db } from "@/db";
import { societies, events, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeft, Globe, Mail, Users } from "lucide-react";
import Link from "next/link";
import type { EventCategory } from "@/types";

export const dynamic = "force-dynamic";

const mockSociety = {
  id: "mock-1",
  name: "Campus Arts Collective",
  description: "A vibrant community of creatives exploring art, design, and culture on campus.",
  bannerUrl: null,
  logoUrl: null,
  contactEmail: "arts@campus.edu",
  website: "https://campus-arts.org",
};

const mockEvents: Array<{
  id: string;
  title: string;
  date: Date;
  location: string;
  category: string;
  imageUrl: string | null;
  rsvpCount: number;
}> = [];

export default async function SocietyProfilePage({
  params,
}: {
  params: Promise<{ societyId: string }>;
}) {
  const { societyId } = await params;

  let society;
  let societyEvents;
  let memberCount = 0;

  try {
    const [result] = await db
      .select()
      .from(societies)
      .where(eq(societies.id, societyId))
      .limit(1);
    if (!result) notFound();
    society = result;

    societyEvents = await db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        location: events.location,
        category: events.category,
        imageUrl: events.imageUrl,
        rsvpCount:
          sql<number>`(SELECT COUNT(*) FROM rsvps WHERE rsvps.event_id = ${events.id} AND rsvps.status = 'going')`,
      })
      .from(events)
      .where(
        and(eq(events.societyId, societyId), eq(events.isPublished, true))
      )
      .orderBy(events.date);

    const [memberResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.societyId, societyId));
    memberCount = Number(memberResult?.count || 0);
  } catch {
    society = { ...mockSociety, id: societyId };
    societyEvents = mockEvents;
    memberCount = 0;
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-medium mb-8 transition-all duration-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      {/* Banner */}
      {society.bannerUrl ? (
        <div className="aspect-[3/1] rounded-2xl overflow-hidden mb-8">
          <img
            src={society.bannerUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[3/1] rounded-2xl bg-gradient-to-r from-violet-50 via-primary/10 to-violet-100 mb-8" />
      )}

      {/* Society info section */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 mb-10 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
            {society.logoUrl ? (
              <img
                src={society.logoUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              society.name.charAt(0)
            )}
          </div>
          <div>
            <h1
              className="text-3xl text-on-surface font-extrabold"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {society.name}
            </h1>
            {society.description && (
              <p className="text-on-surface-variant mt-2 leading-relaxed">
                {society.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-5 mt-4 text-sm">
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <Users className="h-4 w-4" /> {memberCount} members
              </span>
              {society.contactEmail && (
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <Mail className="h-4 w-4" /> {society.contactEmail}
                </span>
              )}
              {society.website && (
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <Globe className="h-4 w-4" /> {society.website}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
        <h2
          className="text-2xl font-extrabold text-on-surface mb-6"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Events
        </h2>
        {societyEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {societyEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                category={event.category as EventCategory}
                societyName={society.name}
                imageUrl={event.imageUrl}
                rsvpCount={Number(event.rsvpCount)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No events yet"
            description="This society hasn't posted any events yet."
          />
        )}
      </div>
    </div>
  );
}
