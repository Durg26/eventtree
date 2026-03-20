import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["student", "organizer", "admin"] }).notNull().default("student"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  societyId: text("society_id").references(() => societies.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const societies = pgTable("societies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  contactEmail: text("contact_email"),
  website: text("website"),
  createdById: text("created_by_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  category: text("category", {
    enum: ["social", "academic", "cultural", "sports", "workshop", "other"],
  }).notNull(),
  imageUrl: text("image_url"),
  societyId: text("society_id").notNull().references(() => societies.id, { onDelete: "cascade" }),
  createdById: text("created_by_id").notNull().references(() => users.id),
  isPublished: boolean("is_published").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("events_date_idx").on(table.date),
  index("events_category_idx").on(table.category),
  index("events_society_idx").on(table.societyId),
]);

export const rsvps = pgTable("rsvps", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["going", "interested"] }).notNull().default("going"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("rsvps_user_event_idx").on(table.userId, table.eventId),
  index("rsvps_event_idx").on(table.eventId),
]);

export const communityPosts = pgTable("community_posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  body: text("body").notNull(),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  societyId: text("society_id").references(() => societies.id, { onDelete: "set null" }),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("posts_created_idx").on(table.createdAt),
]);

export const communityReplies = pgTable("community_replies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const collabRequests = pgTable("collab_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  societyId: text("society_id").notNull().references(() => societies.id, { onDelete: "cascade" }),
  createdById: text("created_by_id").notNull().references(() => users.id),
  eventType: text("event_type"),
  isOpen: boolean("is_open").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("collab_open_idx").on(table.isOpen),
]);

export const collabResponses = pgTable("collab_responses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  collabId: text("collab_id").notNull().references(() => collabRequests.id, { onDelete: "cascade" }),
  societyId: text("society_id").notNull().references(() => societies.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdById: text("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  society: one(societies, { fields: [users.societyId], references: [societies.id] }),
  rsvps: many(rsvps),
  posts: many(communityPosts),
}));

export const societiesRelations = relations(societies, ({ many }) => ({
  members: many(users),
  events: many(events),
  posts: many(communityPosts),
  collabRequests: many(collabRequests),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  society: one(societies, { fields: [events.societyId], references: [societies.id] }),
  createdBy: one(users, { fields: [events.createdById], references: [users.id] }),
  rsvps: many(rsvps),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  user: one(users, { fields: [rsvps.userId], references: [users.id] }),
  event: one(events, { fields: [rsvps.eventId], references: [events.id] }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  author: one(users, { fields: [communityPosts.authorId], references: [users.id] }),
  society: one(societies, { fields: [communityPosts.societyId], references: [societies.id] }),
  replies: many(communityReplies),
}));

export const communityRepliesRelations = relations(communityReplies, ({ one }) => ({
  post: one(communityPosts, { fields: [communityReplies.postId], references: [communityPosts.id] }),
  author: one(users, { fields: [communityReplies.authorId], references: [users.id] }),
}));

export const collabRequestsRelations = relations(collabRequests, ({ one, many }) => ({
  society: one(societies, { fields: [collabRequests.societyId], references: [societies.id] }),
  createdBy: one(users, { fields: [collabRequests.createdById], references: [users.id] }),
  responses: many(collabResponses),
}));

export const collabResponsesRelations = relations(collabResponses, ({ one }) => ({
  collab: one(collabRequests, { fields: [collabResponses.collabId], references: [collabRequests.id] }),
  society: one(societies, { fields: [collabResponses.societyId], references: [societies.id] }),
  createdBy: one(users, { fields: [collabResponses.createdById], references: [users.id] }),
}));
