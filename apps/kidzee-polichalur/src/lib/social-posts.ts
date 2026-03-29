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
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as SocialPost[];
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
