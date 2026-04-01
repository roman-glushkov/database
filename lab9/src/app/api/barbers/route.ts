import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - список парикмахеров
export async function GET() {
  try {
    const barbers = await prisma.barber.findMany({
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

    return NextResponse.json(barbers);
  } catch (error) {
    console.error("Error fetching barbers:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки парикмахеров" },
      { status: 500 }
    );
  }
}

// POST - создание парикмахера
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
      experience,
      specialization,
      certificates,
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Имя и фамилия обязательны" },
        { status: 400 }
      );
    }

    const barber = await prisma.$transaction(async (tx) => {
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

      const barber = await tx.barber.create({
        data: {
          personId: person.id,
          experience: experience ? parseInt(experience) : null,
          specialization: specialization || null,
          certificates: certificates || null,
        },
        include: {
          person: true,
        },
      });

      return barber;
    });

    return NextResponse.json(barber, { status: 201 });
  } catch (error) {
    console.error("Error creating barber:", error);
    return NextResponse.json(
      { error: "Ошибка при создании парикмахера" },
      { status: 500 }
    );
  }
}

// DELETE - удаление парикмахера
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID парикмахера обязателен" },
        { status: 400 }
      );
    }

    const barberId = parseInt(id);

    const barber = await prisma.$transaction(async (tx) => {
      // Находим парикмахера
      const existingBarber = await tx.barber.findUnique({
        where: { id: barberId },
        include: { person: true },
      });

      if (!existingBarber) {
        throw new Error("Парикмахер не найден");
      }

      // Удаляем расписание парикмахера
      await tx.schedule.deleteMany({
        where: { barberId: barberId },
      });

      // Удаляем парикмахера
      await tx.barber.delete({
        where: { id: barberId },
      });

      // Удаляем человека
      await tx.person.delete({
        where: { id: existingBarber.personId },
      });

      return existingBarber;
    });

    return NextResponse.json({ message: "Парикмахер удален", barber });
  } catch (error) {
    console.error("Error deleting barber:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении парикмахера" },
      { status: 500 }
    );
  }
}
