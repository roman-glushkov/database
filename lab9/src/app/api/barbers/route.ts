import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fio = searchParams.get("fio") || "";
    const experience = searchParams.get("experience") || "";
    const specialization = searchParams.get("specialization") || "";
    const schedule = searchParams.get("schedule") || "";

    let barbers = await prisma.barber.findMany({
      include: {
        person: true,
        _count: {
          select: { works: true },
        },
        schedules: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Фильтрация по ФИО
    if (fio) {
      const fioLower = fio.toLowerCase();
      barbers = barbers.filter((barber) => {
        const fullName = `${barber.person.lastName} ${
          barber.person.firstName
        } ${barber.person.middleName || ""}`.toLowerCase();
        return fullName.includes(fioLower);
      });
    }

    // Фильтрация по опыту
    if (experience) {
      barbers = barbers.filter((barber) => {
        const exp = barber.experience || 0;
        switch (experience) {
          case "0-2":
            return exp >= 0 && exp <= 2;
          case "3-5":
            return exp >= 3 && exp <= 5;
          case "6-10":
            return exp >= 6 && exp <= 10;
          case "10+":
            return exp >= 10;
          default:
            return true;
        }
      });
    }

    // Фильтрация по специализации
    if (specialization) {
      barbers = barbers.filter(
        (barber) => barber.specialization === specialization
      );
    }

    // Фильтрация по графику
    if (schedule) {
      barbers = barbers.filter((barber) => {
        const barberSchedules = barber.schedules || [];
        const workingDays = barberSchedules.filter((s) => !s.isDayOff).length;

        switch (schedule) {
          case "5days":
            return workingDays === 5;
          case "2-2":
            return workingDays === 3 || workingDays === 4;
          case "weekend":
            return workingDays === 2;
          case "full":
            return workingDays === 7;
          default:
            return true;
        }
      });
    }

    // Убираем schedules из ответа (чтобы не дублировать)
    const result = barbers.map(({ ...rest }) => rest);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching barbers:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки парикмахеров" },
      { status: 500 }
    );
  }
}

// POST, DELETE остаются без изменений
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
      const existingBarber = await tx.barber.findUnique({
        where: { id: barberId },
        include: { person: true },
      });

      if (!existingBarber) {
        throw new Error("Парикмахер не найден");
      }

      await tx.schedule.deleteMany({
        where: { barberId: barberId },
      });

      await tx.barber.delete({
        where: { id: barberId },
      });

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
