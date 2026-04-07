import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [barbersCount, clientsCount, servicesCount, worksCount, recentWorks] =
    await Promise.all([
      prisma.barber.count(),
      prisma.client.count(),
      prisma.service.count(),
      prisma.work.count(),
      prisma.work.findMany({
        take: 5,
        orderBy: { workDate: "desc" },
        include: {
          barber: { include: { person: true } },
          client: { include: { person: true } },
          service: true,
        },
      }),
    ]);

  return NextResponse.json({
    barbersCount,
    clientsCount,
    servicesCount,
    worksCount,
    recentWorks,
  });
}
