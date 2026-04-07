import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const works = await prisma.work.findMany({
    include: { service: true },
  });

  const serviceMap = new Map();

  for (const work of works) {
    const serviceId = work.service.id;
    if (!serviceMap.has(serviceId)) {
      serviceMap.set(serviceId, {
        id: serviceId,
        name: work.service.name,
        category: work.service.category,
        workCount: 0,
        totalRevenue: 0,
      });
    }
    const stats = serviceMap.get(serviceId);
    stats.workCount++;
    stats.totalRevenue += work.service.price;
  }

  return NextResponse.json(
    Array.from(serviceMap.values()).sort((a, b) => b.workCount - a.workCount)
  );
}
