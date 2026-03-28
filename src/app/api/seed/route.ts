import { NextResponse } from "next/server";
import { getActivities, addActivity } from "@/lib/data";
import { SEED_ACTIVITIES } from "@/lib/seed";

export async function POST() {
  const existing = await getActivities();
  if (existing.length > 0) {
    return NextResponse.json({ message: "Data already exists", count: existing.length });
  }

  for (const activity of SEED_ACTIVITIES) {
    await addActivity(activity);
  }

  return NextResponse.json({ message: "Seeded successfully", count: SEED_ACTIVITIES.length });
}
