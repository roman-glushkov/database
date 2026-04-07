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
    const discount = work.client.discount || 0;
    const originalPrice = work.service.price;
    const finalPrice = originalPrice * (1 - discount / 100);
    const saved = originalPrice - finalPrice;

    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        id: clientId,
        name: clientName,
        discount: discount,
        visitCount: 0,
        totalSpent: 0,
        totalOriginal: 0,
        totalSaved: 0,
      });
    }
    const stats = clientMap.get(clientId);
    stats.visitCount++;
    stats.totalSpent += finalPrice;
    stats.totalOriginal += originalPrice;
    stats.totalSaved += saved;
    stats.discount = discount;
  }

  return NextResponse.json(
    Array.from(clientMap.values()).sort((a, b) => b.totalSpent - a.totalSpent)
  );
}
