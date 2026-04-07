import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "";
  const category = searchParams.get("category") || "";
  const price = searchParams.get("price") || "";
  const popularity = searchParams.get("popularity") || "";

  let services = await prisma.service.findMany({
    include: {
      _count: { select: { works: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (name) {
    const nameLower = name.toLowerCase();
    services = services.filter((service) =>
      service.name.toLowerCase().includes(nameLower)
    );
  }

  if (category) {
    services = services.filter((service) => service.category === category);
  }

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
}

export async function POST(request: NextRequest) {
  const { name, duration, price, category } = await request.json();

  const service = await prisma.service.create({
    data: {
      name,
      duration: duration ? Number(duration) : null,
      price: Number(price),
      category: category || null,
    },
  });

  return NextResponse.json(service, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = Number(new URL(request.url).searchParams.get("id"));

  await prisma.$transaction(async (tx) => {
    await tx.work.deleteMany({ where: { serviceId: id } });
    await tx.service.delete({ where: { id } });
  });

  return NextResponse.json({ message: "Услуга удалена" });
}
