import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const works = await prisma.work.findMany({
    include: { service: true },
  });

  const monthlyMap = new Map();

  for (const work of works) {
    const date = new Date(work.workDate);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthName = date.toLocaleString("ru-RU", {
      month: "long",
      year: "numeric",
    });

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { month: monthName, workCount: 0, revenue: 0 });
    }
    const stats = monthlyMap.get(monthKey);
    stats.workCount++;
    stats.revenue += work.service.price;
  }

  const sorted = Array.from(monthlyMap.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, value]) => value);

  return NextResponse.json(sorted);
}
