"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, User } from "lucide-react";

const navItems = [
  { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organizer/events/new", label: "Create Event", icon: PlusCircle },
  { href: "/organizer/profile", label: "Society Profile", icon: User },
];

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto w-full px-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="bg-white rounded-2xl border border-outline-variant/30 p-4 space-y-1">
            <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant mb-4 px-4">
              Organizer
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 transition-colors ${
                    isActive
                      ? "bg-primary text-white rounded-xl px-4 py-2.5 font-semibold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl px-4 py-2.5"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
