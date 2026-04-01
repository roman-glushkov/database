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

    const barber = await prisma.barber.findUnique({
      where: { id },
      include: {
        person: true,
      },
    });

    if (!barber) {
      return NextResponse.json(
        { error: "Парикмахер не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(barber);
  } catch (error) {
    console.error("Error fetching barber:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки парикмахера" },
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
      experience,
      specialization,
      certificates,
    } = body;

    const barber = await prisma.$transaction(async (tx) => {
      const existingBarber = await tx.barber.findUnique({
        where: { id },
        include: { person: true },
      });

      if (!existingBarber) {
        throw new Error("Парикмахер не найден");
      }

      await tx.person.update({
        where: { id: existingBarber.personId },
        data: {
          firstName,
          lastName,
          middleName: middleName || null,
          birthDate: birthDate ? new Date(birthDate) : null,
          phone: phone || null,
          email: email || null,
        },
      });

      const updatedBarber = await tx.barber.update({
        where: { id },
        data: {
          experience: experience ? parseInt(experience) : null,
          specialization: specialization || null,
          certificates: certificates || null,
        },
        include: { person: true },
      });

      return updatedBarber;
    });

    return NextResponse.json(barber);
  } catch (error) {
    console.error("Error updating barber:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении парикмахера" },
      { status: 500 }
    );
  }
}
