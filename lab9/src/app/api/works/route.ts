import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const client = searchParams.get("client") || "";
    const barber = searchParams.get("barber") || "";
    const service = searchParams.get("service") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    let works = await prisma.work.findMany({
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

    if (client) {
      const clientLower = client.toLowerCase();
      works = works.filter((work) => {
        const fullName = `${work.client.person.lastName} ${
          work.client.person.firstName
        } ${work.client.person.middleName || ""}`.toLowerCase();
        return fullName.includes(clientLower);
      });
    }

    if (barber) {
      const barberLower = barber.toLowerCase();
      works = works.filter((work) => {
        const fullName =
          `${work.barber.person.lastName} ${work.barber.person.firstName}`.toLowerCase();
        return fullName.includes(barberLower);
      });
    }

    if (service) {
      const serviceLower = service.toLowerCase();
      works = works.filter((work) =>
        work.service.name.toLowerCase().includes(serviceLower)
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      works = works.filter((work) => new Date(work.workDate) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      works = works.filter((work) => new Date(work.workDate) <= toDate);
    }

    const worksWithDiscount = works.map((work) => ({
      ...work,
      finalPrice: work.service.price * (1 - (work.client.discount || 0) / 100),
    }));

    return NextResponse.json(worksWithDiscount);
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

    const resultWithDiscount = {
      ...result,
      finalPrice:
        result.service.price * (1 - (result.client.discount || 0) / 100),
    };

    return NextResponse.json(resultWithDiscount, { status: 201 });
  } catch (error) {
    console.error("Error creating work:", error);
    return NextResponse.json(
      { error: "Ошибка при создании работы" },
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
        { error: "ID работы обязателен" },
        { status: 400 }
      );
    }

    const workId = parseInt(id);

    await prisma.review.deleteMany({
      where: { workId: workId },
    });

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
