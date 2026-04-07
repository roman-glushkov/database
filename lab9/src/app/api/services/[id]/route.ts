import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const serviceId = Number(id);

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      _count: { select: { works: true } },
    },
  });

  return NextResponse.json(service);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const serviceId = Number(id);
  const { name, duration, price, category } = await request.json();

  const service = await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: name ?? undefined,
      duration: duration !== undefined ? Number(duration) : undefined,
      price: price !== undefined ? Number(price) : undefined,
      category: category !== undefined ? category : undefined,
    },
  });

  return NextResponse.json(service);
}
