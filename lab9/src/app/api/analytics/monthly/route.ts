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

  // Сортируем ОТ СТАРЫХ К НОВЫМ (по возрастанию)
  const sorted = Array.from(monthlyMap.values()).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime(); // старые → новые
  });

  return NextResponse.json(sorted);
}
