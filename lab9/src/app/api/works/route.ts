import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const works = await prisma.work.findMany({
      include: {
        barber: { include: { person: true } },
        client: { include: { person: true } },
        service: true,
        review: true,
      },
      orderBy: {
        workDate: "desc",
      },
    });

    return NextResponse.json(works);
  } catch (error) {
    console.error("Error fetching works:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки работ" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barberId, serviceId, clientId, workDate } = body;

    if (!barberId || !serviceId || !clientId || !workDate) {
      return NextResponse.json(
        { error: "Все поля обязательны" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const work = await tx.work.create({
        data: {
          barberId: parseInt(barberId),
          serviceId: parseInt(serviceId),
          clientId: parseInt(clientId),
          workDate: new Date(workDate),
        },
        include: {
          barber: { include: { person: true } },
          client: { include: { person: true } },
          service: true,
        },
      });

      const workCount = await tx.work.count({
        where: { clientId: parseInt(clientId) },
      });

      if (workCount === 1) {
        await tx.client.update({
          where: { id: parseInt(clientId) },
          data: { firstVisit: new Date(workDate) },
        });
      }

      return work;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating work:", error);
    return NextResponse.json(
      { error: "Ошибка при создании работы" },
      { status: 500 }
    );
  }
}

// DELETE - удаление работы
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID работы обязателен" },
        { status: 400 }
      );
    }

    const workId = parseInt(id);

    // Сначала удаляем связанный отзыв (если есть)
    await prisma.review.deleteMany({
      where: { workId: workId },
    });

    // Затем удаляем работу
    await prisma.work.delete({
      where: { id: workId },
    });

    return NextResponse.json({ message: "Работа удалена" });
  } catch (error) {
    console.error("Error deleting work:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении работы" },
      { status: 500 }
    );
  }
}
