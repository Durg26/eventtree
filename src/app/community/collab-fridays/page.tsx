"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  MessageSquare,
  Loader2,
  Send,
  ArrowLeft,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface CollabRequest {
  id: string;
  title: string;
  description: string;
  eventType: string | null;
  isOpen: boolean;
  createdAt: string;
  societyName: string;
  societyId: string;
  createdByName: string;
  responseCount: number;
}

interface CollabResponse {
  id: string;
  message: string;
  createdAt: string;
  societyName: string;
  createdByName: string;
}

const FILTERS = ["All", "Open", "Closed"];

const MOCK_COLLABS: CollabRequest[] = [
  {
    id: "mock-collab-1",
    title: "Partner for Cultural Night - Spring 2026",
    description:
      "We're organizing a cultural night and looking for societies interested in co-hosting. We need help with performances, food, and decorations. Let's make it a campus-wide celebration!",
    eventType: "Cultural",
    isOpen: true,
    createdAt: new Date().toISOString(),
    societyName: "International Students Association",
    societyId: "mock-soc-1",
    createdByName: "Maria Garcia",
    responseCount: 4,
  },
  {
    id: "mock-collab-2",
    title: "Joint Workshop: Resume Building + Interview Skills",
    description:
      "Looking for a society to co-host a career prep workshop. We can cover the resume portion if you handle mock interviews.",
    eventType: "Workshop",
    isOpen: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    societyName: "Business Society",
    societyId: "mock-soc-2",
    createdByName: "David Kim",
    responseCount: 2,
  },
  {
    id: "mock-collab-3",
    title: "Hackathon Co-organizers Needed",
    description:
      "Planning a 24-hour hackathon for next month. Need help with sponsorships, mentors, and venue logistics.",
    eventType: "Social",
    isOpen: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    societyName: "CS Society",
    societyId: "mock-soc-3",
    createdByName: "Sarah Lee",
    responseCount: 6,
  },
];

export default function CollabFridaysPage() {
  const { data: session } = useSession();
  const user = session?.user as
    | { role?: string; societyId?: string }
    | undefined;
  const [collabs, setCollabs] = useState<CollabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollab, setSelectedCollab] = useState<
    (CollabRequest & { responses: CollabResponse[] }) | null
  >(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [newCollabOpen, setNewCollabOpen] = useState(false);
  const [respondOpen, setRespondOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCollabs() {
      try {
        const res = await fetch("/api/collab");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCollabs(data.length > 0 ? data : MOCK_COLLABS);
      } catch {
        setCollabs(MOCK_COLLABS);
      } finally {
        setLoading(false);
      }
    }
    fetchCollabs();
  }, []);

  async function createCollab(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/collab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          eventType: form.get("eventType") || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Collab request posted!");
        setNewCollabOpen(false);
        const data = await fetch("/api/collab").then((r) => r.json());
        setCollabs(data);
      } else {
        toast.error("Failed to post");
      }
    } catch {
      toast.error("Failed to post");
    }
    setSubmitting(false);
  }

  async function viewCollab(collabId: string) {
    try {
      const res = await fetch(`/api/collab/${collabId}`);
      const data = await res.json();
      setSelectedCollab(data);
    } catch {
      toast.error("Failed to load collab details");
    }
  }

  async function submitResponse() {
    if (!selectedCollab || !responseMessage.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/collab/${selectedCollab.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: responseMessage }),
      });
      if (res.ok) {
        toast.success("Response sent!");
        setRespondOpen(false);
        setResponseMessage("");
        await viewCollab(selectedCollab.id);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to respond");
      }
    } catch {
      toast.error("Failed to respond");
    }
    setSubmitting(false);
  }

  const filteredCollabs = collabs.filter((c) => {
    if (activeFilter === "Open") return c.isOpen;
    if (activeFilter === "Closed") return !c.isOpen;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl p-8 md:p-12 bg-primary-container/20 shadow-sm mb-10">
        {/* Abstract blur circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-tertiary/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <span className="inline-block px-4 py-1 rounded-full bg-primary text-on-primary text-xs font-bold tracking-widest uppercase mb-4">
            Collab Fridays
          </span>
          <h1
            className="text-4xl md:text-6xl font-extrabold text-on-primary-container leading-tight mb-4"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            <Sparkles className="inline h-10 w-10 text-tertiary mr-3" />
            Collab Fridays
          </h1>
          <p className="text-on-primary-container/70 text-lg max-w-2xl mb-6">
            Find collaboration partners for your next event. Post a request or
            respond to one -- let&apos;s build something amazing together.{" "}
            <span className="text-tertiary font-bold">#CollabFridays</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {user?.role === "organizer" && (
              <button
                onClick={() => setNewCollabOpen(true)}
                className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Post Collab Request
              </button>
            )}
            <Link
              href="/community"
              className="px-8 py-3 bg-tertiary-container text-on-tertiary-container rounded-full font-bold hover:bg-tertiary-container/80 transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Community Board
            </Link>
          </div>
        </div>
      </section>

      {/* New Collab Modal */}
      {newCollabOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h2
              className="text-xl font-extrabold text-on-surface mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Post a Collab Request
            </h2>
            <form onSubmit={createCollab} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">
                  What are you looking for?
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g., Partner for cultural night"
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">
                  Details
                </label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Describe the event and what kind of partner you're looking for..."
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">
                  Event type (optional)
                </label>
                <input
                  name="eventType"
                  placeholder="e.g., Cultural, Social, Workshop"
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setNewCollabOpen(false)}
                  className="px-6 py-2 bg-surface-container-high text-on-surface-variant rounded-full font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold text-sm"
                >
                  {submitting ? "Posting..." : "Post Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {respondOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h2
              className="text-xl font-extrabold text-on-surface mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Respond to Collab Request
            </h2>
            <textarea
              placeholder="Tell them about your society and how you'd like to collaborate..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={4}
              className="w-full bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setRespondOpen(false);
                  setResponseMessage("");
                }}
                className="px-6 py-2 bg-surface-container-high text-on-surface-variant rounded-full font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitResponse}
                disabled={submitting || !responseMessage.trim()}
                className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold text-sm disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send Response"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCollab ? (
        /* Single Collab Detail View */
        <div>
          <button
            onClick={() => setSelectedCollab(null)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to collabs
          </button>

          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  selectedCollab.isOpen
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {selectedCollab.isOpen ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {selectedCollab.isOpen ? "Open" : "Closed"}
              </span>
              {selectedCollab.eventType && (
                <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold">
                  {selectedCollab.eventType}
                </span>
              )}
            </div>
            <h2
              className="text-2xl md:text-3xl font-extrabold text-on-surface mb-3"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {selectedCollab.title}
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Posted by{" "}
              <span className="font-bold text-tertiary">
                {selectedCollab.societyName}
              </span>{" "}
              &middot;{" "}
              {new Date(selectedCollab.createdAt).toLocaleDateString()}
            </p>
            <p className="whitespace-pre-wrap text-on-surface-variant leading-relaxed mb-8">
              {selectedCollab.description}
            </p>

            <div className="border-t border-outline-variant/10 pt-6">
              <h4
                className="font-extrabold text-on-surface mb-4"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Responses ({selectedCollab.responses?.length || 0})
              </h4>
              <div className="space-y-4 mb-6">
                {selectedCollab.responses?.map((resp) => (
                  <div
                    key={resp.id}
                    className="bg-surface-container-low rounded-xl p-4 border-l-4 border-tertiary"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-tertiary">
                        {resp.societyName}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {new Date(resp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {resp.message}
                    </p>
                  </div>
                ))}
              </div>

              {user?.role === "organizer" &&
                selectedCollab.isOpen &&
                user.societyId !== selectedCollab.societyId && (
                  <button
                    onClick={() => setRespondOpen(true)}
                    className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform inline-flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" /> Respond to this request
                  </button>
                )}
            </div>
          </div>
        </div>
      ) : (
        /* Main Collabs Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={
                    activeFilter === filter
                      ? "px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-sm font-bold"
                      : "px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-full text-sm font-bold"
                  }
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Collab Cards */}
            {filteredCollabs.length > 0 ? (
              <div className="space-y-4">
                {filteredCollabs.map((collab) => (
                  <div
                    key={collab.id}
                    onClick={() => viewCollab(collab.id)}
                    className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5 hover:border-primary/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              collab.isOpen
                                ? "bg-tertiary-container text-on-tertiary-container"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {collab.isOpen ? "Open" : "Closed"}
                          </span>
                          {collab.eventType && (
                            <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold">
                              {collab.eventType}
                            </span>
                          )}
                        </div>
                        <h3
                          className="font-extrabold text-on-surface mt-1"
                          style={{ fontFamily: "var(--font-headline)" }}
                        >
                          {collab.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant line-clamp-2 mt-1">
                          {collab.description}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-3">
                          by{" "}
                          <span className="font-bold text-tertiary">
                            {collab.societyName}
                          </span>{" "}
                          &middot;{" "}
                          {new Date(collab.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant ml-4">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm font-bold">
                          {collab.responseCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest p-12 rounded-xl text-center">
                <Sparkles className="h-12 w-12 text-on-surface-variant/30 mx-auto mb-4" />
                <h3
                  className="text-xl font-extrabold text-on-surface mb-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  No collab requests yet
                </h3>
                <p className="text-on-surface-variant">
                  Society organizers can post collaboration requests here.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* How It Works */}
            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="border-l-4 border-tertiary pl-4 mb-4">
                <h3
                  className="font-extrabold text-on-surface"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  How It Works
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      Post a Request
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Describe the event you want to co-host
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      Get Responses
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Other societies express their interest
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      Collaborate
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Connect and plan your event together
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Collab Stats */}
            <div className="bg-secondary-container p-6 rounded-xl">
              <h3
                className="font-extrabold text-on-secondary-container mb-4"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Collab Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-secondary-container/70 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Total Requests
                  </span>
                  <span className="font-bold text-on-secondary-container">
                    {collabs.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-secondary-container/70 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Open Requests
                  </span>
                  <span className="font-bold text-on-secondary-container">
                    {collabs.filter((c) => c.isOpen).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-secondary-container/70 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Total Responses
                  </span>
                  <span className="font-bold text-on-secondary-container">
                    {collabs.reduce((sum, c) => sum + c.responseCount, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Back to Community */}
            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="border-l-4 border-tertiary pl-4">
                <h3
                  className="font-extrabold text-on-surface mb-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Community Board
                </h3>
                <p className="text-sm text-on-surface-variant mb-3">
                  Join the wider conversation with fellow students.
                </p>
                <Link
                  href="/community"
                  className="px-6 py-2 bg-tertiary-container text-on-tertiary-container rounded-full font-bold text-sm hover:bg-tertiary-container/80 transition-all inline-block"
                >
                  Visit Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
