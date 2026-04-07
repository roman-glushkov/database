import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const clientId = Number(id);

  const client = await prisma.client.findUnique({
    where: { id: clientId },
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

  return NextResponse.json(client);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const clientId = Number(id);
  const { firstName, lastName, middleName, birthDate, phone, email, discount } =
    await request.json();

  const existingClient = await prisma.client.findUnique({
    where: { id: clientId },
    include: { person: true },
  });

  const client = await prisma.$transaction(async (tx) => {
    await tx.person.update({
      where: { id: existingClient!.personId },
      data: {
        firstName: firstName ?? existingClient!.person.firstName,
        lastName: lastName ?? existingClient!.person.lastName,
        middleName: middleName ?? existingClient!.person.middleName,
        birthDate: birthDate
          ? new Date(birthDate)
          : existingClient!.person.birthDate,
        phone: phone ?? existingClient!.person.phone,
        email: email ?? existingClient!.person.email,
      },
    });

    const updatedClient = await tx.client.update({
      where: { id: clientId },
      data: {
        discount:
          discount !== undefined ? Number(discount) : existingClient!.discount,
      },
      include: { person: true },
    });

    return updatedClient;
  });

  return NextResponse.json(client);
}
