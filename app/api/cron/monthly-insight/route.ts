import { NextRequest, NextResponse } from "next/server";
import { generateAndCacheMonthlyInsight, getPreviousYearMonthKST, isFirstOfMonthKST } from "@/lib/monthly-insights";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allows an admin to manually (re)generate a specific month, e.g. for backfilling,
  // bypassing the "only run on the 1st" gate below. Still requires CRON_SECRET.
  const monthOverride = request.nextUrl.searchParams.get("month");

  if (!monthOverride && !isFirstOfMonthKST()) {
    return NextResponse.json({ skipped: true, reason: "not the 1st of the month (KST)" });
  }

  const yearMonth = monthOverride || getPreviousYearMonthKST();
  const insight = await generateAndCacheMonthlyInsight(yearMonth);

  if (!insight) {
    return NextResponse.json({ skipped: true, reason: `no meditations found for ${yearMonth}, or Gemini generation failed` });
  }

  return NextResponse.json({ success: true, yearMonth, insight });
}
