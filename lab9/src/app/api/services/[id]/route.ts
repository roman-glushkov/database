import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { works: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки услуги" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { name, duration, price, category } = body;

    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: name || existingService.name,
        duration: duration ? parseInt(duration) : existingService.duration,
        price: price ? parseFloat(price) : existingService.price,
        category: category !== undefined ? category : existingService.category,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении услуги" },
      { status: 500 }
    );
  }
}
