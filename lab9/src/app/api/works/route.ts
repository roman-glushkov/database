import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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
    orderBy: { workDate: "desc" },
  });

  if (client) {
    const clientLower = client.toLowerCase();
    works = works.filter((work) =>
      `${work.client.person.lastName} ${work.client.person.firstName} ${
        work.client.person.middleName || ""
      }`
        .toLowerCase()
        .includes(clientLower)
    );
  }

  if (barber) {
    const barberLower = barber.toLowerCase();
    works = works.filter((work) =>
      `${work.barber.person.lastName} ${work.barber.person.firstName}`
        .toLowerCase()
        .includes(barberLower)
    );
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
}

export async function POST(request: NextRequest) {
  const { barberId, serviceId, clientId, workDate } = await request.json();

  const work = await prisma.$transaction(async (tx) => {
    const newWork = await tx.work.create({
      data: {
        barberId: Number(barberId),
        serviceId: Number(serviceId),
        clientId: Number(clientId),
        workDate: new Date(workDate),
      },
      include: {
        barber: { include: { person: true } },
        client: { include: { person: true } },
        service: true,
      },
    });

    const workCount = await tx.work.count({
      where: { clientId: Number(clientId) },
    });

    if (workCount === 1) {
      await tx.client.update({
        where: { id: Number(clientId) },
        data: { firstVisit: new Date(workDate) },
      });
    }

    return newWork;
  });

  const resultWithDiscount = {
    ...work,
    finalPrice: work.service.price * (1 - (work.client.discount || 0) / 100),
  };

  return NextResponse.json(resultWithDiscount, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = Number(new URL(request.url).searchParams.get("id"));

  await prisma.review.deleteMany({ where: { workId: id } });
  await prisma.work.delete({ where: { id } });

  return NextResponse.json({ message: "Работа удалена" });
}
