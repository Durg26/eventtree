"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  MessageSquare,
  Pin,
  Plus,
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

const MOCK_POSTS: Post[] = [
  {
    id: "mock-1",
    title: "Welcome to the Community Board!",
    body: "This is a space for Dal students and societies to connect, share ideas, and collaborate. Feel free to start a conversation!",
    isPinned: true,
    createdAt: new Date().toISOString(),
    authorName: "EventTree Team",
    authorId: "system",
    societyName: null,
    replyCount: 3,
  },
  {
    id: "mock-2",
    title: "Looking for study group partners - CSCI 3120",
    body: "Anyone interested in forming a study group for Operating Systems? We can meet at the Killam Library on weekends.",
    isPinned: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    authorName: "Alex Chen",
    authorId: "mock-user-1",
    societyName: "CS Society",
    replyCount: 7,
  },
  {
    id: "mock-3",
    title: "Tips for first-year students",
    body: "Hey everyone! As someone who just finished first year, here are some tips I wish I knew earlier...",
    isPinned: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    authorName: "Jordan Smith",
    authorId: "mock-user-2",
    societyName: null,
    replyCount: 12,
  },
];

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<
    (Post & { replies: Reply[] }) | null
  >(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [newPostOpen, setNewPostOpen] = useState(false);
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
        setPosts(data.length > 0 ? data : MOCK_POSTS);
      } catch {
        setPosts(MOCK_POSTS);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  async function createPost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          body: form.get("body"),
        }),
      });
      if (res.ok) {
        toast.success("Post created!");
        setNewPostOpen(false);
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
      <section className="relative overflow-hidden rounded-xl p-8 md:p-12 bg-primary-container/20 shadow-sm mb-10">
        {/* Abstract blur circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-tertiary/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <span className="inline-block px-4 py-1 rounded-full bg-primary text-on-primary text-xs font-bold tracking-widest uppercase mb-4">
            Community
          </span>
          <h1
            className="text-4xl md:text-6xl font-extrabold text-on-primary-container leading-tight mb-4"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Community Board
          </h1>
          <p className="text-on-primary-container/70 text-lg max-w-2xl mb-6">
            Connect with fellow Dal students and societies. Share ideas, ask
            questions, and build your campus community.
          </p>
          <div className="flex flex-wrap gap-3">
            {session && (
              <button
                onClick={() => setNewPostOpen(true)}
                className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> New Post
              </button>
            )}
            <Link
              href="/community/collab-fridays"
              className="px-8 py-3 bg-tertiary-container text-on-tertiary-container rounded-full font-bold hover:bg-tertiary-container/80 transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Collab Fridays
            </Link>
          </div>
        </div>
      </section>

      {/* New Post Modal */}
      {newPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <h2
              className="text-xl font-extrabold text-on-surface mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Create a Post
            </h2>
            <form onSubmit={createPost} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">
                  Title
                </label>
                <input
                  name="title"
                  required
                  minLength={3}
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="What's on your mind?"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">
                  Body
                </label>
                <textarea
                  name="body"
                  rows={4}
                  required
                  minLength={10}
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="Share your thoughts..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setNewPostOpen(false)}
                  className="px-6 py-2 bg-surface-container-high text-on-surface-variant rounded-full font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold text-sm"
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPost ? (
        /* Single Post Detail View */
        <div>
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to posts
          </button>

          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-4">
              {selectedPost.isPinned && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold">
                  <Pin className="h-3 w-3 inline mr-1" />
                  Pinned
                </span>
              )}
              <span className="text-sm text-on-surface-variant flex items-center gap-1">
                <User className="h-3 w-3" /> {selectedPost.authorName}
              </span>
              <span className="text-xs text-on-surface-variant">
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

            <div className="border-t border-outline-variant/10 pt-6">
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
                    className="bg-surface-container-low rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-on-surface">
                        {reply.authorName}
                      </span>
                      <span className="text-xs text-on-surface-variant">
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
                    className="flex-1 bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <button
                    onClick={submitReply}
                    disabled={submitting || !replyText.trim()}
                    className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold text-sm flex items-center gap-2 disabled:opacity-50"
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
                      ? "px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-sm font-bold"
                      : "px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-full text-sm font-bold"
                  }
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Quick Post Box */}
            {session && (
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
                <input
                  placeholder="Post title..."
                  value={quickPostTitle}
                  onChange={(e) => setQuickPostTitle(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none mb-3 text-sm font-bold"
                />
                <textarea
                  placeholder="What's on your mind?"
                  value={quickPostBody}
                  onChange={(e) => setQuickPostBody(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleQuickPost}
                    disabled={
                      submitting ||
                      !quickPostTitle.trim() ||
                      !quickPostBody.trim()
                    }
                    className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold text-sm disabled:opacity-50"
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
                    className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5 hover:border-primary/20 transition-all cursor-pointer"
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
                            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
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
              <div className="bg-surface-container-lowest p-12 rounded-xl text-center">
                <MessageSquare className="h-12 w-12 text-on-surface-variant/30 mx-auto mb-4" />
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
            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="border-l-4 border-tertiary pl-4 mb-4">
                <h3
                  className="font-extrabold text-on-surface flex items-center gap-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  <Sparkles className="h-5 w-5 text-tertiary" />
                  Collab Fridays
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Find collaboration partners for your next event.{" "}
                  <span className="text-tertiary font-bold">
                    #CollabFridays
                  </span>
                </p>
              </div>
              <Link
                href="/community/collab-fridays"
                className="px-6 py-2 bg-tertiary-container text-on-tertiary-container rounded-full font-bold text-sm hover:bg-tertiary-container/80 transition-all inline-block"
              >
                Explore Collabs
              </Link>
            </div>

            {/* Community Stats */}
            <div className="bg-secondary-container p-6 rounded-xl">
              <h3
                className="font-extrabold text-on-secondary-container mb-4"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-secondary-container/70 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Total Posts
                  </span>
                  <span className="font-bold text-on-secondary-container">
                    {posts.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-secondary-container/70 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Active Members
                  </span>
                  <span className="font-bold text-on-secondary-container">
                    {new Set(posts.map((p) => p.authorId)).size}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-secondary-container/70 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Total Replies
                  </span>
                  <span className="font-bold text-on-secondary-container">
                    {posts.reduce((sum, p) => sum + p.replyCount, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-surface-container-low p-6 rounded-xl">
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
