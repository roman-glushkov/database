import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: { works: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки услуг" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, duration, price, category } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Название и цена обязательны" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        duration: duration ? parseInt(duration) : null,
        price: parseFloat(price),
        category: category || null,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Ошибка при создании услуги" },
      { status: 500 }
    );
  }
}

// DELETE - удаление услуги
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID услуги обязателен" },
        { status: 400 }
      );
    }

    const serviceId = parseInt(id);

    const service = await prisma.$transaction(async (tx) => {
      const existingService = await tx.service.findUnique({
        where: { id: serviceId },
      });

      if (!existingService) {
        throw new Error("Услуга не найдена");
      }

      // Сначала удаляем все работы с этой услугой
      await tx.work.deleteMany({
        where: { serviceId: serviceId },
      });

      // Затем удаляем услугу
      const deletedService = await tx.service.delete({
        where: { id: serviceId },
      });

      return deletedService;
    });

    return NextResponse.json({ message: "Услуга удалена", service });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении услуги" },
      { status: 500 }
    );
  }
}
