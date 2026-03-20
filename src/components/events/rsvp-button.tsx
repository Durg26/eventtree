"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Check, Star } from "lucide-react";
import { toast } from "sonner";

interface RsvpButtonProps {
  eventId: string;
  currentStatus: "going" | "interested" | null;
  rsvpCount: number;
}

export function RsvpButton({
  eventId,
  currentStatus,
  rsvpCount,
}: RsvpButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState(currentStatus);
  const [count, setCount] = useState(rsvpCount);
  const [loading, setLoading] = useState(false);

  async function handleRsvp(newStatus: "going" | "interested") {
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);

    try {
      if (status === newStatus) {
        // Remove RSVP
        const res = await fetch(`/api/events/${eventId}/rsvp`, {
          method: "DELETE",
        });
        if (res.ok) {
          if (status === "going") setCount((c) => c - 1);
          setStatus(null);
          toast.success("RSVP removed");
        }
      } else {
        // Create/update RSVP
        const res = await fetch(`/api/events/${eventId}/rsvp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          if (newStatus === "going" && status !== "going")
            setCount((c) => c + 1);
          if (newStatus === "interested" && status === "going")
            setCount((c) => c - 1);
          setStatus(newStatus);
          toast.success(
            newStatus === "going" ? "You're going!" : "Marked as interested"
          );
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const goingClass =
    status === "going"
      ? "bg-primary text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-primary-dim transition-colors duration-200"
      : "bg-surface-container-low border border-outline-variant/30 text-on-surface px-6 py-3 rounded-xl font-semibold hover:border-primary/30 transition-colors duration-200";

  const interestedClass =
    status === "interested"
      ? "bg-primary text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-primary-dim transition-colors duration-200"
      : "bg-surface-container-low border border-outline-variant/30 text-on-surface px-6 py-3 rounded-xl font-semibold hover:border-primary/30 transition-colors duration-200";

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          onClick={() => handleRsvp("going")}
          disabled={loading}
          className={`${goingClass} inline-flex items-center gap-2 disabled:opacity-50`}
        >
          <Check className="h-4 w-4" />
          {status === "going" ? "Going!" : "I'm Going"}
        </button>
        <button
          onClick={() => handleRsvp("interested")}
          disabled={loading}
          className={`${interestedClass} inline-flex items-center gap-2 disabled:opacity-50`}
        >
          <Star className="h-4 w-4" />
          {status === "interested" ? "Interested" : "Maybe"}
        </button>
      </div>
      <p className="text-sm text-on-surface-variant">
        {count} {count === 1 ? "person" : "people"} going
      </p>
    </div>
  );
}
