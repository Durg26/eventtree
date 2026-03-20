"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, Building2, Database } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/events", label: "Events", icon: CalendarDays },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/societies", label: "Societies", icon: Building2 },
    { href: "/admin/database", label: "Database", icon: Database },
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto w-full px-6">
      <div className="flex gap-8">
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="bg-surface-container-low rounded-xl p-4 sticky top-28">
            <h2
              className="text-lg font-extrabold text-on-background mb-1 px-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Admin Panel
            </h2>
            <p className="text-xs text-outline mb-4 px-4">Manage everything</p>
            <nav className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive(link.href)
                      ? "flex items-center gap-3 bg-primary-container text-on-primary-container font-semibold rounded-xl px-4 py-3 transition-colors"
                      : "flex items-center gap-3 text-on-surface-variant hover:bg-surface-container rounded-xl px-4 py-3 transition-colors"
                  }
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-sm">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
