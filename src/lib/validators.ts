import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "organizer"]).default("student"),
});

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional(),
  category: z.enum(["social", "academic", "cultural", "sports", "workshop", "other"]),
  imageUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const communityPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(10, "Post body must be at least 10 characters"),
});

export const replySchema = z.object({
  body: z.string().min(1, "Reply cannot be empty"),
});

export const collabSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventType: z.string().optional(),
});

export const societySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  contactEmail: z.email().optional().or(z.literal("")),
  website: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type CommunityPostInput = z.infer<typeof communityPostSchema>;
export type ReplyInput = z.infer<typeof replySchema>;
export type CollabInput = z.infer<typeof collabSchema>;
export type SocietyInput = z.infer<typeof societySchema>;
