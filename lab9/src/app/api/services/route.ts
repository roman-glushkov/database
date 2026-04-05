import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "";
    const category = searchParams.get("category") || "";
    const price = searchParams.get("price") || "";
    const popularity = searchParams.get("popularity") || "";

    let services = await prisma.service.findMany({
      include: {
        _count: {
          select: { works: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Фильтрация по названию
    if (name) {
      const nameLower = name.toLowerCase();
      services = services.filter((service) =>
        service.name.toLowerCase().includes(nameLower)
      );
    }

    // Фильтрация по категории
    if (category) {
      services = services.filter((service) => service.category === category);
    }

    // Фильтрация по цене
    if (price) {
      services = services.filter((service) => {
        const servicePrice = service.price;
        switch (price) {
          case "0-500":
            return servicePrice >= 0 && servicePrice <= 500;
          case "500-1000":
            return servicePrice >= 500 && servicePrice <= 1000;
          case "1000-2000":
            return servicePrice >= 1000 && servicePrice <= 2000;
          case "2000+":
            return servicePrice >= 2000;
          default:
            return true;
        }
      });
    }

    // Фильтрация по популярности (количество выполнений)
    if (popularity) {
      services = services.filter((service) => {
        const worksCount = service._count?.works || 0;
        switch (popularity) {
          case "0":
            return worksCount === 0;
          case "1-5":
            return worksCount >= 1 && worksCount <= 5;
          case "5-10":
            return worksCount >= 5 && worksCount <= 10;
          case "10+":
            return worksCount >= 10;
          default:
            return true;
        }
      });
    }

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

      await tx.work.deleteMany({
        where: { serviceId: serviceId },
      });

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
