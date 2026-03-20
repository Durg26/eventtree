"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Users, Building2, Ticket, TrendingUp, UserPlus, Loader2 } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalSocieties: number;
  totalRsvps: number;
  eventsThisWeek: number;
  newUsersThisWeek: number;
  roleBreakdown: { role: string; count: number }[];
}

const mockStats: Stats = {
  totalUsers: 284,
  totalEvents: 47,
  totalSocieties: 12,
  totalRsvps: 1520,
  eventsThisWeek: 8,
  newUsersThisWeek: 23,
  roleBreakdown: [
    { role: "student", count: 245 },
    { role: "organizer", count: 34 },
    { role: "admin", count: 5 },
  ],
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        setStats(data);
      } catch {
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-outline" />
      </div>
    );
  }

  if (!stats) return <p className="text-on-surface-variant">Failed to load stats.</p>;

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, iconBg: "bg-primary/10 text-primary" },
    { label: "Total Events", value: stats.totalEvents, icon: CalendarDays, iconBg: "bg-tertiary/10 text-tertiary" },
    { label: "Total Societies", value: stats.totalSocieties, icon: Building2, iconBg: "bg-secondary/10 text-secondary" },
    { label: "Total RSVPs", value: stats.totalRsvps, icon: Ticket, iconBg: "bg-primary/10 text-primary" },
    { label: "Events This Week", value: stats.eventsThisWeek, icon: TrendingUp, iconBg: "bg-tertiary/10 text-tertiary" },
    { label: "New Users This Week", value: stats.newUsersThisWeek, icon: UserPlus, iconBg: "bg-secondary/10 text-secondary" },
  ];

  return (
    <div>
      <h1
        className="text-4xl font-extrabold text-on-background tracking-tight mb-8"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Admin Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-on-surface">{stat.value}</p>
                <p className="text-sm text-on-surface-variant">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <h2
          className="text-lg font-bold text-on-surface mb-4"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Users by Role
        </h2>
        <div className="flex gap-8">
          {stats.roleBreakdown.map((r) => (
            <div key={r.role} className="text-center">
              <p className="text-2xl font-extrabold text-on-surface">{r.count}</p>
              <p className="text-sm text-on-surface-variant capitalize">{r.role}s</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
