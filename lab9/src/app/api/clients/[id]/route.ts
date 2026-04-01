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

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        person: true,
        works: {
          include: {
            service: true,
            barber: { include: { person: true } },
          },
          orderBy: { workDate: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки клиента" },
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
    const {
      firstName,
      lastName,
      middleName,
      birthDate,
      phone,
      email,
      discount,
    } = body;

    const client = await prisma.$transaction(async (tx) => {
      const existingClient = await tx.client.findUnique({
        where: { id },
        include: { person: true },
      });

      if (!existingClient) {
        throw new Error("Клиент не найден");
      }

      await tx.person.update({
        where: { id: existingClient.personId },
        data: {
          firstName,
          lastName,
          middleName: middleName || null,
          birthDate: birthDate ? new Date(birthDate) : null,
          phone: phone || null,
          email: email || null,
        },
      });

      const updatedClient = await tx.client.update({
        where: { id },
        data: {
          discount: discount ? parseInt(discount) : 0,
        },
        include: { person: true },
      });

      return updatedClient;
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении клиента" },
      { status: 500 }
    );
  }
}
