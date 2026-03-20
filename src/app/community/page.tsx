"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  MessageSquare,
  Pin,
  User,
  Loader2,
  Send,
  Sparkles,
  Users,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
  authorName: string;
  authorId: string;
  societyName: string | null;
  replyCount: number;
}

interface Reply {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
}

const FILTERS = ["All", "Pinned", "Recent", "Most Replies"];

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<
    (Post & { replies: Reply[] }) | null
  >(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [quickPostTitle, setQuickPostTitle] = useState("");
  const [quickPostBody, setQuickPostBody] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/community");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPosts(data);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  async function handleQuickPost() {
    if (!quickPostTitle.trim() || !quickPostBody.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickPostTitle,
          body: quickPostBody,
        }),
      });
      if (res.ok) {
        toast.success("Post created!");
        setQuickPostTitle("");
        setQuickPostBody("");
        const data = await fetch("/api/community").then((r) => r.json());
        setPosts(data);
      } else {
        toast.error("Failed to create post");
      }
    } catch {
      toast.error("Failed to create post");
    }
    setSubmitting(false);
  }

  async function viewPost(postId: string) {
    try {
      const res = await fetch(`/api/community/${postId}`);
      const data = await res.json();
      setSelectedPost(data);
    } catch {
      toast.error("Failed to load post");
    }
  }

  async function submitReply() {
    if (!selectedPost || !replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/community/${selectedPost.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText }),
      });
      if (res.ok) {
        setReplyText("");
        await viewPost(selectedPost.id);
        toast.success("Reply added!");
      }
    } catch {
      toast.error("Failed to add reply");
    }
    setSubmitting(false);
  }

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "Pinned") return post.isPinned;
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeFilter === "Most Replies") return b.replyCount - a.replyCount;
    if (activeFilter === "Recent")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
      <section className="gradient-mesh relative overflow-hidden rounded-2xl p-8 md:p-12 mb-10">
        {/* Abstract blur circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl blur-orb" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-violet-300/10 rounded-full blur-3xl blur-orb" />

        <div className="relative z-10">
          <span className="inline-block px-4 py-1 rounded-full bg-primary text-white text-xs font-bold tracking-widest uppercase mb-4">
            Community
          </span>
          <h1
            className="text-4xl md:text-6xl font-extrabold text-on-surface leading-tight mb-4"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Community Board
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mb-6">
            Connect with fellow Dal students and societies. Share ideas, ask
            questions, and build your campus community.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/community/collab-fridays"
              className="px-8 py-3 bg-violet-100 text-primary rounded-xl font-semibold hover:bg-violet-200 transition-colors duration-200 inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Collab Fridays
            </Link>
          </div>
        </div>
      </section>


      {selectedPost ? (
        /* Single Post Detail View */
        <div>
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-semibold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to posts
          </button>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/30 card-hover">
            <div className="flex items-center gap-3 mb-4">
              {selectedPost.isPinned && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Pin className="h-3 w-3 inline mr-1" />
                  Pinned
                </span>
              )}
              <span className="text-sm text-on-surface-variant flex items-center gap-1">
                <User className="h-3 w-3" /> {selectedPost.authorName}
              </span>
              <span className="text-xs text-on-surface-variant/70">
                {new Date(selectedPost.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2
              className="text-2xl md:text-3xl font-extrabold text-on-surface mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {selectedPost.title}
            </h2>
            <p className="whitespace-pre-wrap text-on-surface-variant leading-relaxed mb-8">
              {selectedPost.body}
            </p>

            <div className="border-t border-outline-variant/30 pt-6">
              <h4
                className="font-extrabold text-on-surface mb-4"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Replies ({selectedPost.replies?.length || 0})
              </h4>
              <div className="space-y-4 mb-6">
                {selectedPost.replies?.map((reply) => (
                  <div
                    key={reply.id}
                    className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-on-surface">
                        {reply.authorName}
                      </span>
                      <span className="text-xs text-on-surface-variant/70">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {reply.body}
                    </p>
                  </div>
                ))}
              </div>
              {session && (
                <div className="flex gap-3">
                  <input
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && submitReply()
                    }
                    className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
                  />
                  <button
                    onClick={submitReply}
                    disabled={submitting || !replyText.trim()}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50 hover:bg-primary-dim transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Main Feed Layout */
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
                      ? "px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold transition-colors duration-200"
                      : "px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-full text-sm font-bold hover:bg-surface-container transition-colors duration-200"
                  }
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Quick Post Box */}
            {session && (
              <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 card-hover">
                <input
                  placeholder="Post title..."
                  value={quickPostTitle}
                  onChange={(e) => setQuickPostTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none mb-3 text-sm font-bold"
                />
                <textarea
                  placeholder="What's on your mind?"
                  value={quickPostBody}
                  onChange={(e) => setQuickPostBody(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleQuickPost}
                    disabled={
                      submitting ||
                      !quickPostTitle.trim() ||
                      !quickPostBody.trim()
                    }
                    className="px-6 py-2 bg-primary text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-primary-dim transition-colors"
                  >
                    {submitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            )}

            {/* Post Cards */}
            {sortedPosts.length > 0 ? (
              <div className="space-y-4">
                {sortedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => viewPost(post.id)}
                    className="bg-white p-6 rounded-2xl border border-outline-variant/30 card-hover hover:border-primary/20 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && (
                            <Pin className="h-3.5 w-3.5 text-primary" />
                          )}
                          <h3
                            className="font-extrabold text-on-surface"
                            style={{ fontFamily: "var(--font-headline)" }}
                          >
                            {post.title}
                          </h3>
                        </div>
                        <p className="text-sm text-on-surface-variant line-clamp-2">
                          {post.body}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> {post.authorName}
                          </span>
                          {post.societyName && (
                            <span className="px-2 py-0.5 rounded-full bg-violet-50 text-primary text-xs font-bold">
                              {post.societyName}
                            </span>
                          )}
                          <span>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant ml-4">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm font-bold">
                          {post.replyCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-outline-variant/30 text-center">
                <MessageSquare className="h-12 w-12 text-outline-variant mx-auto mb-4" />
                <h3
                  className="text-xl font-extrabold text-on-surface mb-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  No posts yet
                </h3>
                <p className="text-on-surface-variant">
                  Be the first to start a conversation!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Collab Fridays Card */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 card-hover">
              <div className="border-l-4 border-primary pl-4 mb-4">
                <h3
                  className="font-extrabold text-on-surface flex items-center gap-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                  Collab Fridays
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Find collaboration partners for your next event.{" "}
                  <span className="text-primary font-semibold">
                    #CollabFridays
                  </span>
                </p>
              </div>
              <Link
                href="/community/collab-fridays"
                className="text-primary font-semibold hover:underline inline-block"
              >
                Explore Collabs
              </Link>
            </div>

            {/* Community Stats */}
            <div className="bg-violet-50 p-6 rounded-2xl border border-outline-variant/30">
              <h3
                className="font-extrabold text-on-surface mb-4"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Total Posts
                  </span>
                  <span className="font-bold text-on-surface">
                    {posts.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant flex items-center gap-2">
                    <Users className="h-4 w-4" /> Active Members
                  </span>
                  <span className="font-bold text-on-surface">
                    {new Set(posts.map((p) => p.authorId)).size}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Total Replies
                  </span>
                  <span className="font-bold text-on-surface">
                    {posts.reduce((sum, p) => sum + p.replyCount, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 card-hover">
              <h3
                className="font-extrabold text-on-surface mb-3"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Community Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>Be respectful and inclusive</li>
                <li>No spam or self-promotion</li>
                <li>Keep discussions on-topic</li>
                <li>Report inappropriate content</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
