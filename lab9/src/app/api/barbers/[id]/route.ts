import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const barberId = Number(id);

  const barber = await prisma.barber.findUnique({
    where: { id: barberId },
    include: { person: true },
  });

  return NextResponse.json(barber);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const barberId = Number(id);
  const {
    firstName,
    lastName,
    middleName,
    birthDate,
    phone,
    email,
    experience,
    specialization,
    certificates,
  } = await request.json();

  const existingBarber = await prisma.barber.findUnique({
    where: { id: barberId },
    include: { person: true },
  });

  const barber = await prisma.$transaction(async (tx) => {
    await tx.person.update({
      where: { id: existingBarber!.personId },
      data: {
        firstName: firstName ?? existingBarber!.person.firstName,
        lastName: lastName ?? existingBarber!.person.lastName,
        middleName: middleName ?? existingBarber!.person.middleName,
        birthDate: birthDate
          ? new Date(birthDate)
          : existingBarber!.person.birthDate,
        phone: phone ?? existingBarber!.person.phone,
        email: email ?? existingBarber!.person.email,
      },
    });

    const updatedBarber = await tx.barber.update({
      where: { id: barberId },
      data: {
        experience:
          experience !== undefined
            ? Number(experience)
            : existingBarber!.experience,
        specialization: specialization ?? existingBarber!.specialization,
        certificates: certificates ?? existingBarber!.certificates,
      },
      include: { person: true },
    });

    return updatedBarber;
  });

  return NextResponse.json(barber);
}
