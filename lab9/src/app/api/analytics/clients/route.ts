import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const works = await prisma.work.findMany({
    include: {
      client: { include: { person: true } },
      service: true,
    },
  });

  const clientMap = new Map();
  for (const work of works) {
    const clientId = work.client.id;
    const clientName = `${work.client.person.lastName} ${work.client.person.firstName}`;
    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        id: clientId,
        name: clientName,
        visitCount: 0,
        totalSpent: 0,
      });
    }
    const stats = clientMap.get(clientId);
    stats.visitCount++;
    stats.totalSpent += work.service.price;
  }

  return NextResponse.json(
    Array.from(clientMap.values()).sort((a, b) => b.totalSpent - a.totalSpent)
  );
}
