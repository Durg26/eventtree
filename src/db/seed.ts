import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import * as schema from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Seeding database...");

  // Create admin user
  const adminHash = await hash("admin123", 12);
  const [admin] = await db.insert(schema.users).values({
    name: "Admin User",
    email: "admin@dal.ca",
    passwordHash: adminHash,
    role: "admin",
  }).returning();
  console.log("Created admin:", admin.email);

  // Create societies
  const [csSociety] = await db.insert(schema.societies).values({
    name: "Computer Science Society",
    slug: "cs-society",
    description: "The official computer science student society at Dalhousie. We host hackathons, workshops, and social events for CS students.",
    contactEmail: "css@dal.ca",
    createdById: admin.id,
  }).returning();

  const [engSociety] = await db.insert(schema.societies).values({
    name: "Engineering Society",
    slug: "eng-society",
    description: "Dalhousie Engineering Society - bringing engineering students together through events, competitions, and community.",
    contactEmail: "eng@dal.ca",
    createdById: admin.id,
  }).returning();

  const [artsSociety] = await db.insert(schema.societies).values({
    name: "Arts & Culture Collective",
    slug: "arts-collective",
    description: "A space for creative expression at Dal. We organize art shows, open mics, film screenings, and cultural celebrations.",
    contactEmail: "arts@dal.ca",
    createdById: admin.id,
  }).returning();
  console.log("Created 3 societies");

  // Create organizer users
  const orgHash = await hash("organizer123", 12);
  const [csOrg] = await db.insert(schema.users).values({
    name: "Sarah Chen",
    email: "sarah@dal.ca",
    passwordHash: orgHash,
    role: "organizer",
    societyId: csSociety.id,
  }).returning();

  const [engOrg] = await db.insert(schema.users).values({
    name: "Marcus Rivera",
    email: "marcus@dal.ca",
    passwordHash: orgHash,
    role: "organizer",
    societyId: engSociety.id,
  }).returning();

  const [artsOrg] = await db.insert(schema.users).values({
    name: "Priya Sharma",
    email: "priya@dal.ca",
    passwordHash: orgHash,
    role: "organizer",
    societyId: artsSociety.id,
  }).returning();

  // Create student users
  const studentHash = await hash("student123", 12);
  await db.insert(schema.users).values([
    { name: "Alex Kim", email: "alex@dal.ca", passwordHash: studentHash, role: "student" as const },
    { name: "Jordan Lee", email: "jordan@dal.ca", passwordHash: studentHash, role: "student" as const },
  ]);
  console.log("Created 5 users (1 admin, 3 organizers, 2 students)");

  // Create events
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const eventsData = [
    {
      title: "Hackathon: Build for Good",
      description: "24-hour hackathon focused on building apps that make a positive impact on the Halifax community. Prizes include $500, mentorship sessions, and free pizza all weekend. All skill levels welcome!",
      location: "Goldberg Computer Science Building, Room 127",
      date: new Date(now + 3 * day),
      endDate: new Date(now + 4 * day),
      category: "workshop" as const,
      societyId: csSociety.id,
      createdById: csOrg.id,
      isPublished: true,
    },
    {
      title: "Python Workshop: Web Scraping 101",
      description: "Learn the basics of web scraping with Python's BeautifulSoup and requests libraries. Bring your laptop! We'll work through hands-on exercises together.",
      location: "Killam Library, Room 2020",
      date: new Date(now + 5 * day),
      category: "workshop" as const,
      societyId: csSociety.id,
      createdById: csOrg.id,
      isPublished: true,
    },
    {
      title: "Engineering Design Showcase",
      description: "Come see final-year Capstone projects from all engineering disciplines. Students will present their designs and prototypes. Light refreshments provided.",
      location: "Sexton Campus, Design Commons",
      date: new Date(now + 7 * day),
      category: "academic" as const,
      societyId: engSociety.id,
      createdById: engOrg.id,
      isPublished: true,
    },
    {
      title: "Bridge Building Competition",
      description: "Can you build the strongest bridge using only popsicle sticks and glue? Teams of 2-4, prizes for the top 3 designs. Registration required.",
      location: "Engineering Building, Lab B",
      date: new Date(now + 10 * day),
      category: "sports" as const,
      societyId: engSociety.id,
      createdById: engOrg.id,
      isPublished: true,
    },
    {
      title: "Open Mic Night",
      description: "Share your poetry, music, comedy, or whatever you've been working on. A supportive space for creative expression. Sign up at the door or just come to watch!",
      location: "The Grawood Lounge",
      date: new Date(now + 2 * day),
      category: "cultural" as const,
      societyId: artsSociety.id,
      createdById: artsOrg.id,
      isPublished: true,
    },
    {
      title: "Film Screening: Local Filmmakers",
      description: "Showcasing short films made by Halifax-based filmmakers. Q&A with directors after the screening. Free popcorn!",
      location: "McCain Building, Room 2016",
      date: new Date(now + 6 * day),
      category: "cultural" as const,
      societyId: artsSociety.id,
      createdById: artsOrg.id,
      isPublished: true,
    },
    {
      title: "CS Society Social: Board Game Night",
      description: "Take a break from coding and join us for board games, snacks, and good company. We have Catan, Codenames, and more. BYOG (bring your own game) welcome!",
      location: "Student Union Building, Room 307",
      date: new Date(now + 4 * day),
      category: "social" as const,
      societyId: csSociety.id,
      createdById: csOrg.id,
      isPublished: true,
    },
    {
      title: "Networking Mixer: Tech Industry",
      description: "Meet professionals from Halifax's growing tech scene. Casual networking event with light appetizers. Business casual dress code.",
      location: "Dalhousie Club, University Avenue",
      date: new Date(now + 14 * day),
      category: "social" as const,
      societyId: csSociety.id,
      createdById: csOrg.id,
      isPublished: true,
    },
    {
      title: "Cultural Festival Prep Meeting",
      description: "Planning meeting for the upcoming multicultural festival. If you want to volunteer, perform, or have a food booth, come share your ideas!",
      location: "Student Union Building, Room 224",
      date: new Date(now + 1 * day),
      category: "cultural" as const,
      societyId: artsSociety.id,
      createdById: artsOrg.id,
      isPublished: true,
    },
    {
      title: "Study Jam: Midterm Prep",
      description: "Group study session before midterms. TAs from multiple courses will be available. Bring your notes and questions. Coffee provided.",
      location: "Killam Library, Learning Commons",
      date: new Date(now + 8 * day),
      category: "academic" as const,
      societyId: csSociety.id,
      createdById: csOrg.id,
      isPublished: true,
    },
  ];

  await db.insert(schema.events).values(eventsData);
  console.log("Created 10 events");

  // Create community posts
  await db.insert(schema.communityPosts).values([
    {
      title: "Welcome to EventTree!",
      body: "Hey everyone! This is the community board where you can share updates, ask questions, and connect with other societies. Feel free to start conversations!",
      authorId: admin.id,
      isPinned: true,
    },
    {
      title: "Looking for volunteers for upcoming hackathon",
      body: "We need 10 volunteers to help run the Build for Good hackathon next week. Tasks include registration desk, food distribution, and mentoring. If you're interested, drop a reply!",
      authorId: csOrg.id,
      societyId: csSociety.id,
    },
    {
      title: "Feedback wanted: What events do you want to see?",
      body: "The Arts Collective is planning our semester calendar. What kind of events would you love to see? Art workshops? Film nights? Poetry slams? Let us know!",
      authorId: artsOrg.id,
      societyId: artsSociety.id,
    },
  ]);
  console.log("Created 3 community posts");

  // Create collab requests
  await db.insert(schema.collabRequests).values([
    {
      title: "Tech + Art: Interactive Installation",
      description: "We want to create an interactive digital art installation for the cultural festival. Looking for a tech-savvy society to help with the coding/hardware side. We handle the creative vision, you help bring it to life!",
      societyId: artsSociety.id,
      createdById: artsOrg.id,
      eventType: "cultural",
      isOpen: true,
    },
    {
      title: "Joint Study Session: Engineering + CS",
      description: "Would love to organize a cross-disciplinary study session where engineering and CS students can help each other with overlapping courses (algorithms, systems design, etc). Who's in?",
      societyId: engSociety.id,
      createdById: engOrg.id,
      eventType: "academic",
      isOpen: true,
    },
  ]);
  console.log("Created 2 collab requests");

  console.log("\nSeed complete! Login credentials:");
  console.log("Admin: admin@dal.ca / admin123");
  console.log("Organizer: sarah@dal.ca / organizer123");
  console.log("Organizer: marcus@dal.ca / organizer123");
  console.log("Organizer: priya@dal.ca / organizer123");
  console.log("Student: alex@dal.ca / student123");
}

seed().catch(console.error);
