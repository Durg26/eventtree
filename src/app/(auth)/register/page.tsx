"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TreesIcon } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-surface pt-24">
      <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-amber-900/10 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <TreesIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1
            className="text-3xl font-extrabold text-on-surface mb-2"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Join EventTree
          </h1>
          <p className="text-on-surface-variant">
            Create your account and start <span className="text-primary font-bold">discovering</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div className="text-sm text-error bg-error/10 px-4 py-3 rounded-xl font-semibold">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="text-sm font-bold text-on-surface-variant mb-2 block">
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Your name"
              required
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-on-surface-variant/50"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-bold text-on-surface-variant mb-2 block">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@dal.ca"
              required
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-on-surface-variant/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-bold text-on-surface-variant mb-2 block">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-on-surface-variant mb-2 block">I am a...</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
                  role === "student"
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("organizer")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
                  role === "organizer"
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Society Organizer
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-sm text-on-surface-variant text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
