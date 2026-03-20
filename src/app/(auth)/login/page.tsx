"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
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
      router.push(callbackUrl);
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
            Welcome back
          </h1>
          <p className="text-on-surface-variant text-sm">
            Sign in to your <span className="text-primary font-semibold">EventTree</span> account
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-error bg-error/10 px-4 py-3 rounded-xl font-medium">
              {error}
            </div>
          )}

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
              required
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow-sm hover:bg-primary-dim transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-sm text-on-surface-variant text-center pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
