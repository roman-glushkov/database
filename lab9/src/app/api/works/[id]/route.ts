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

    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        barber: { include: { person: true } },
        client: { include: { person: true } },
        service: true,
        review: true,
      },
    });

    if (!work) {
      return NextResponse.json({ error: "Работа не найдена" }, { status: 404 });
    }

    return NextResponse.json(work);
  } catch (error) {
    console.error("Error fetching work:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки работы" },
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
    const { clientId, barberId, serviceId, workDate } = body;

    const work = await prisma.work.update({
      where: { id },
      data: {
        clientId: parseInt(clientId),
        barberId: parseInt(barberId),
        serviceId: parseInt(serviceId),
        workDate: new Date(workDate),
      },
      include: {
        barber: { include: { person: true } },
        client: { include: { person: true } },
        service: true,
      },
    });

    return NextResponse.json(work);
  } catch (error) {
    console.error("Error updating work:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении работы" },
      { status: 500 }
    );
  }
}
