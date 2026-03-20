import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "student" | "organizer" | "admin";
      societyId: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role: string;
    societyId: string | null;
  }

  interface JWT {
    role: string;
    societyId: string | null;
  }
}

export type EventCategory = "social" | "academic" | "cultural" | "sports" | "workshop" | "other";
export type UserRole = "student" | "organizer" | "admin";
export type RsvpStatus = "going" | "interested";
