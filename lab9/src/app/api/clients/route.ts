import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fio = searchParams.get("fio") || "";
  const discount = searchParams.get("discount") || "";
  const visits = searchParams.get("visits") || "";

  let clients = await prisma.client.findMany({
    include: {
      person: true,
      _count: { select: { works: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (fio) {
    const fioLower = fio.toLowerCase();
    clients = clients.filter((client) =>
      `${client.person.lastName} ${client.person.firstName} ${
        client.person.middleName || ""
      }`
        .toLowerCase()
        .includes(fioLower)
    );
  }

  if (discount) {
    clients = clients.filter((client) => {
      const disc = client.discount || 0;
      switch (discount) {
        case "0":
          return disc === 0;
        case "1-10":
          return disc >= 1 && disc <= 10;
        case "11-20":
          return disc >= 11 && disc <= 20;
        case "20+":
          return disc >= 20;
        default:
          return true;
      }
    });
  }

  if (visits) {
    clients = clients.filter((client) => {
      const visitsCount = client._count?.works || 0;
      switch (visits) {
        case "0":
          return visitsCount === 0;
        case "1-3":
          return visitsCount >= 1 && visitsCount <= 3;
        case "4-10":
          return visitsCount >= 4 && visitsCount <= 10;
        case "10+":
          return visitsCount >= 10;
        default:
          return true;
      }
    });
  }

  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const { firstName, lastName, middleName, birthDate, phone, email, discount } =
    await request.json();

  const client = await prisma.$transaction(async (tx) => {
    const person = await tx.person.create({
      data: {
        firstName,
        lastName,
        middleName: middleName || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        phone: phone || null,
        email: email || null,
      },
    });

    const client = await tx.client.create({
      data: {
        personId: person.id,
        discount: discount ? Number(discount) : 0,
        firstVisit: null,
      },
      include: { person: true },
    });

    return client;
  });

  return NextResponse.json(client, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = Number(new URL(request.url).searchParams.get("id"));

  const client = await prisma.$transaction(async (tx) => {
    const existingClient = await tx.client.findUnique({
      where: { id },
      include: { person: true },
    });

    await tx.work.deleteMany({ where: { clientId: id } });
    await tx.client.delete({ where: { id } });
    await tx.person.delete({ where: { id: existingClient!.personId } });

    return existingClient;
  });

  return NextResponse.json({ message: "Клиент удален", client });
}
