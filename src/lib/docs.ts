import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const contentDir = path.join(process.cwd(), "content");

export interface Doc {
  slug: string;
  title: string;
  description: string;
  order: number;
  audience: string;
  readTime: string;
  content: string;
  html: string;
}

const DOC_META: Record<
  string,
  { title: string; description: string; order: number; audience: string; readTime: string }
> = {
  "complete-solution": {
    title: "Complete Solution",
    description: "The big picture — CRM + WhatsApp platform overview, architecture, workflows, and costs",
    order: 1,
    audience: "Owners / Decision Makers",
    readTime: "10 min",
  },
  proposal: {
    title: "Proposal",
    description: "Detailed system proposal with architecture, code documentation, setup guide, and roadmap",
    order: 2,
    audience: "Owners / Decision Makers",
    readTime: "15 min",
  },
  "cost-analysis": {
    title: "Cost Analysis",
    description: "Monthly cost projections, commercial platform comparisons, and ROI assessment",
    order: 3,
    audience: "Owners / Decision Makers",
    readTime: "10 min",
  },
  "demo-guide": {
    title: "Demo Guide",
    description: "8 hands-on demos to try the WhatsApp notification system yourself",
    order: 4,
    audience: "Everyone",
    readTime: "15 min (hands-on)",
  },
  "user-guide": {
    title: "User Guide",
    description: "Day-to-day operations reference for staff managing students and schedules",
    order: 5,
    audience: "Staff / Operations",
    readTime: "10 min",
  },
};

export function getAllDocs(): Omit<Doc, "html">[] {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const slug = file.replace(".md", "");
      const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
      const { content } = matter(raw);
      const meta = DOC_META[slug] || {
        title: slug,
        description: "",
        order: 99,
        audience: "",
        readTime: "",
      };

      return { slug, ...meta, content, html: "" };
    })
    .sort((a, b) => a.order - b.order);
}

export async function getDoc(slug: string): Promise<Doc | null> {
  const filePath = path.join(contentDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  const meta = DOC_META[slug] || {
    title: slug,
    description: "",
    order: 99,
    audience: "",
    readTime: "",
  };

  const html = await marked(content);

  return { slug, ...meta, content, html };
}
