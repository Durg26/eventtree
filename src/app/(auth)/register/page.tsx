"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"student" | "organizer">("student");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: body.email,
      password: body.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created but sign-in failed. Please log in.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh pt-24 px-4">
      <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl shadow-black/5 border border-outline-variant/20 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold text-on-surface mb-2"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Join EventTree
          </h1>
          <p className="text-on-surface-variant text-sm">
            Create your account and start <span className="text-primary font-semibold">discovering</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-error bg-error/10 px-4 py-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="text-sm font-medium text-on-surface mb-1.5 block">
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Your name"
              required
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none placeholder:text-on-surface-variant/40 transition-all text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-on-surface mb-1.5 block">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@dal.ca"
              required
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none placeholder:text-on-surface-variant/40 transition-all text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-on-surface mb-1.5 block">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-on-surface mb-1.5 block">I am a...</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  role === "student"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:border-primary/30"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("organizer")}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  role === "organizer"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:border-primary/30"
                }`}
              >
                Society Organizer
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow-sm hover:bg-primary-dim transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-sm text-on-surface-variant text-center pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
