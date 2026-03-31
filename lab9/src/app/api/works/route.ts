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
      // Создаем работу
      const work = await tx.work.create({
        data: {
          barberId: parseInt(barberId),
          serviceId: parseInt(serviceId),
          clientId: parseInt(clientId),
          workDate: new Date(workDate),
        },
      });

      // Проверяем количество работ у клиента
      const workCount = await tx.work.count({
        where: { clientId: parseInt(clientId) },
      });

      // Если это первая работа клиента - обновляем firstVisit
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
