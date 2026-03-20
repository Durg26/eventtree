"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, Shield } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string | null; role?: string } | undefined;
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/community", label: "Community" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-2xl border-b border-outline-variant/10 transition-all">
      <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-on-surface tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
          Event Tree.
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1" style={{ fontFamily: 'var(--font-headline)' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center hover:bg-primary/20 transition-colors">
                <User className="h-4 w-4 text-primary" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl shadow-xl border border-outline-variant/20 p-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-bold text-on-surface">{user?.name}</p>
                  <p className="text-xs text-on-surface-variant capitalize">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                {user?.role === "organizer" && (
                  <DropdownMenuItem>
                    <Link href="/organizer/dashboard" className="flex items-center w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === "admin" && (
                  <DropdownMenuItem>
                    <Link href="/admin" className="flex items-center w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-full text-sm font-semibold bg-on-surface text-white border-2 border-dashed border-on-surface hover:bg-on-surface/90 transition-colors"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
