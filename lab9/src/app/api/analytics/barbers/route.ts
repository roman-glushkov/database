import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const works = await prisma.work.findMany({
    include: {
      barber: { include: { person: true } },
      service: true,
    },
  });

  const barberMap = new Map();

  for (const work of works) {
    const barberId = work.barber.id;
    const barberName = `${work.barber.person.lastName} ${work.barber.person.firstName}`;
    if (!barberMap.has(barberId)) {
      barberMap.set(barberId, {
        id: barberId,
        name: barberName,
        workCount: 0,
        totalRevenue: 0,
      });
    }
    const stats = barberMap.get(barberId);
    stats.workCount++;
    stats.totalRevenue += work.service.price;
  }

  return NextResponse.json(
    Array.from(barberMap.values()).sort((a, b) => b.workCount - a.workCount)
  );
}
