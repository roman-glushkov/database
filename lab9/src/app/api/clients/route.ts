import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fio = searchParams.get("fio") || "";
    const discount = searchParams.get("discount") || "";
    const visits = searchParams.get("visits") || "";

    let clients = await prisma.client.findMany({
      include: {
        person: true,
        _count: {
          select: { works: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Фильтрация по ФИО
    if (fio) {
      const fioLower = fio.toLowerCase();
      clients = clients.filter((client) => {
        const fullName = `${client.person.lastName} ${
          client.person.firstName
        } ${client.person.middleName || ""}`.toLowerCase();
        return fullName.includes(fioLower);
      });
    }

    // Фильтрация по скидке
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

    // Фильтрация по количеству визитов
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
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки клиентов" },
      { status: 500 }
    );
  }
}

// POST, DELETE остаются без изменений
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      middleName,
      birthDate,
      phone,
      email,
      discount,
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Имя и фамилия обязательны" },
        { status: 400 }
      );
    }

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
          discount: discount ? parseInt(discount) : 0,
          firstVisit: null,
        },
        include: {
          person: true,
        },
      });

      return client;
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Ошибка при создании клиента" },
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
        { error: "ID клиента обязателен" },
        { status: 400 }
      );
    }

    const clientId = parseInt(id);

    const client = await prisma.$transaction(async (tx) => {
      const existingClient = await tx.client.findUnique({
        where: { id: clientId },
        include: { person: true },
      });

      if (!existingClient) {
        throw new Error("Клиент не найден");
      }

      await tx.work.deleteMany({
        where: { clientId: clientId },
      });

      await tx.client.delete({
        where: { id: clientId },
      });

      await tx.person.delete({
        where: { id: existingClient.personId },
      });

      return existingClient;
    });

    return NextResponse.json({ message: "Клиент удален", client });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении клиента" },
      { status: 500 }
    );
  }
}
