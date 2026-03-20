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
      <section className="gradient-mesh relative overflow-hidden rounded-2xl p-8 md:p-12 mb-10">
        {/* Abstract blur circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-violet-300/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <span className="inline-block px-4 py-1 rounded-full bg-primary text-white text-xs font-bold tracking-widest uppercase mb-4">
            Community
          </span>
          <h1
            className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Community Board
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mb-6">
            Connect with fellow Dal students and societies. Share ideas, ask
            questions, and build your campus community.
          </p>
          <div className="flex flex-wrap gap-3">
            {session && (
              <button
                onClick={() => setNewPostOpen(true)}
                className="px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-black/5 hover:bg-primary-dim transition-colors inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> New Post
              </button>
            )}
            <Link
              href="/community/collab-fridays"
              className="px-8 py-3 bg-violet-100 text-primary rounded-xl font-semibold hover:bg-violet-200 transition-all duration-300 inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Collab Fridays
            </Link>
          </div>
        </div>
      </section>

      {/* New Post Modal */}
      {newPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-lg shadow-black/5 border border-outline-variant/30">
            <h2
              className="text-xl font-extrabold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Create a Post
            </h2>
            <form onSubmit={createPost} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">
                  Title
                </label>
                <input
                  name="title"
                  required
                  minLength={3}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
                  placeholder="What's on your mind?"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">
                  Body
                </label>
                <textarea
                  name="body"
                  rows={4}
                  required
                  minLength={10}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none resize-none"
                  placeholder="Share your thoughts..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setNewPostOpen(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dim transition-colors"
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
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to posts
          </button>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              {selectedPost.isPinned && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Pin className="h-3 w-3 inline mr-1" />
                  Pinned
                </span>
              )}
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <User className="h-3 w-3" /> {selectedPost.authorName}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(selectedPost.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2
              className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {selectedPost.title}
            </h2>
            <p className="whitespace-pre-wrap text-gray-600 leading-relaxed mb-8">
              {selectedPost.body}
            </p>

            <div className="border-t border-outline-variant/30 pt-6">
              <h4
                className="font-extrabold text-gray-900 mb-4"
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
                      <span className="text-sm font-bold text-gray-900">
                        {reply.authorName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
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
                    className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
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
                      ? "px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold transition-all duration-300"
                      : "px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm font-bold hover:bg-gray-200 transition-all duration-300"
                  }
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Quick Post Box */}
            {session && (
              <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 hover:shadow-lg transition-all duration-300">
                <input
                  placeholder="Post title..."
                  value={quickPostTitle}
                  onChange={(e) => setQuickPostTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none mb-3 text-sm font-bold"
                />
                <textarea
                  placeholder="What's on your mind?"
                  value={quickPostBody}
                  onChange={(e) => setQuickPostBody(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none resize-none mb-3"
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
                    className="bg-white p-6 rounded-2xl border border-outline-variant/30 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && (
                            <Pin className="h-3.5 w-3.5 text-primary" />
                          )}
                          <h3
                            className="font-extrabold text-gray-900"
                            style={{ fontFamily: "var(--font-headline)" }}
                          >
                            {post.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {post.body}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
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
                      <div className="flex items-center gap-1 text-gray-500 ml-4">
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
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3
                  className="text-xl font-extrabold text-gray-900 mb-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  No posts yet
                </h3>
                <p className="text-gray-500">
                  Be the first to start a conversation!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Collab Fridays Card */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 hover:shadow-lg transition-all duration-300">
              <div className="border-l-4 border-primary pl-4 mb-4">
                <h3
                  className="font-extrabold text-gray-900 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                  Collab Fridays
                </h3>
                <p className="text-sm text-gray-500 mt-1">
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
                className="font-extrabold text-gray-900 mb-4"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Total Posts
                  </span>
                  <span className="font-bold text-gray-900">
                    {posts.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Active Members
                  </span>
                  <span className="font-bold text-gray-900">
                    {new Set(posts.map((p) => p.authorId)).size}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Total Replies
                  </span>
                  <span className="font-bold text-gray-900">
                    {posts.reduce((sum, p) => sum + p.replyCount, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 hover:shadow-lg transition-all duration-300">
              <h3
                className="font-extrabold text-gray-900 mb-3"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Community Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-gray-500">
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
