import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workId = Number(id);

  const work = await prisma.work.findUnique({
    where: { id: workId },
    include: {
      barber: { include: { person: true } },
      client: { include: { person: true } },
      service: true,
      review: true,
    },
  });

  return NextResponse.json(work);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workId = Number(id);
  const { clientId, barberId, serviceId, workDate } = await request.json();

  const work = await prisma.work.update({
    where: { id: workId },
    data: {
      clientId: Number(clientId),
      barberId: Number(barberId),
      serviceId: Number(serviceId),
      workDate: new Date(workDate),
    },
    include: {
      barber: { include: { person: true } },
      client: { include: { person: true } },
      service: true,
    },
  });

  return NextResponse.json(work);
}
