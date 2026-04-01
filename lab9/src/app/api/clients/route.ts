import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
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

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки клиентов" },
      { status: 500 }
    );
  }
}

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

// DELETE - удаление клиента
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

      // Удаляем все работы клиента
      await tx.work.deleteMany({
        where: { clientId: clientId },
      });

      // Удаляем клиента
      await tx.client.delete({
        where: { id: clientId },
      });

      // Удаляем человека
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
