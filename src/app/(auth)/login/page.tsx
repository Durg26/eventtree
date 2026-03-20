"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TreesIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
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
            Welcome back
          </h1>
          <p className="text-on-surface-variant">
            Sign in to your <span className="text-primary font-bold">EventTree</span> account
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div className="text-sm text-error bg-error/10 px-4 py-3 rounded-xl font-semibold">
              {error}
            </div>
          )}

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
              required
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-sm text-on-surface-variant text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-bold">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
