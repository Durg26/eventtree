import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import type { EventCategory } from "@/types";

interface EventCardProps {
  id: string;
  title: string;
  date: Date;
  location: string;
  category: EventCategory;
  societyName: string;
  imageUrl?: string | null;
  rsvpCount?: number;
}

const categoryColors: Record<string, string> = {
  social: "bg-pink-100 text-pink-700",
  academic: "bg-blue-100 text-blue-700",
  workshop: "bg-violet-100 text-violet-700",
  cultural: "bg-amber-100 text-amber-700",
  sports: "bg-emerald-100 text-emerald-700",
  meeting: "bg-slate-100 text-slate-700",
};

export function EventCard({ id, title, date, location, category, societyName, imageUrl, rsvpCount }: EventCardProps) {
  return (
    <Link href={`/events/${id}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant/30 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
        <div className="h-48 relative overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full gradient-mesh-hero flex items-center justify-center">
              <Calendar className="h-10 w-10 text-primary/25" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${categoryColors[category] || "bg-gray-100 text-gray-700"}`}>
              {category}
            </span>
          </div>
        </div>
        <div className="p-5">
          <span className="text-xs font-medium text-primary mb-1 block">{societyName}</span>
          <h3 className="text-base font-bold text-on-surface mb-3 line-clamp-2 leading-snug" style={{ fontFamily: 'var(--font-headline)' }}>
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs mb-4">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center">
            <span className="text-xs font-semibold text-on-surface">
              {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            {rsvpCount !== undefined && rsvpCount > 0 && (
              <span className="text-xs text-on-surface-variant">{rsvpCount} going</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
