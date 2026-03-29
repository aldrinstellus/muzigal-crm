import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "social-posts.json");

export type SocialPlatform = "instagram" | "facebook" | "both";
export type SocialPostStatus = "queued" | "published" | "failed";

export interface SocialPost {
  id: string;
  activityId: string;
  activityTitle: string;
  caption: string;
  images: string[];
  platform: SocialPlatform;
  status: SocialPostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
}

async function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export async function getSocialPosts(): Promise<SocialPost[]> {
  try {
    await ensureDataFile();
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as SocialPost[];
  } catch {
    // Read-only filesystem (e.g., Vercel) — return empty array
    return [];
  }
}

export async function addSocialPost(post: SocialPost): Promise<SocialPost> {
  const all = await getSocialPosts();
  all.push(post);
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2));
  return post;
}

export async function getSocialPostsByActivity(activityId: string): Promise<SocialPost[]> {
  const all = await getSocialPosts();
  return all.filter((p) => p.activityId === activityId);
}

export async function deleteSocialPost(id: string): Promise<boolean> {
  const all = await getSocialPosts();
  const filtered = all.filter((p) => p.id !== id);
  if (filtered.length === all.length) return false;
  await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

export async function updateSocialPost(id: string, updates: Partial<SocialPost>): Promise<SocialPost | null> {
  const all = await getSocialPosts();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], ...updates };
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2));
  return all[index];
}

export function generateCaption(title: string, description: string, tags: string[]): string {
  const lines: string[] = [];

  lines.push(`✨ ${title}`);
  lines.push("");
  lines.push(description);
  lines.push("");
  lines.push("🏫 Kidzee Polichalur — Where little minds bloom!");
  lines.push("");

  const hashtags = [
    "#Kidzee",
    "#KidzeePolichalur",
    "#PreschoolFun",
    "#EarlyLearning",
    "#LittleLearners",
    "#PreschoolLife",
    ...tags.map((t) => `#${t.replace(/\s+/g, "")}`),
  ];

  lines.push(hashtags.join(" "));

  return lines.join("\n");
}
