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
