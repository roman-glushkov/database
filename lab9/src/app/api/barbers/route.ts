import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fio = searchParams.get("fio") || "";
  const experience = searchParams.get("experience") || "";
  const specialization = searchParams.get("specialization") || "";
  const schedule = searchParams.get("schedule") || "";

  let barbers = await prisma.barber.findMany({
    include: {
      person: true,
      _count: { select: { works: true } },
      schedules: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (fio) {
    const fioLower = fio.toLowerCase();
    barbers = barbers.filter((barber) =>
      `${barber.person.lastName} ${barber.person.firstName} ${
        barber.person.middleName || ""
      }`
        .toLowerCase()
        .includes(fioLower)
    );
  }

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

  if (specialization) {
    barbers = barbers.filter(
      (barber) => barber.specialization === specialization
    );
  }

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

  return NextResponse.json(barbers);
}

export async function POST(request: NextRequest) {
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
        experience: experience ? Number(experience) : null,
        specialization: specialization || null,
        certificates: certificates || null,
      },
      include: { person: true },
    });

    return barber;
  });

  return NextResponse.json(barber, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = Number(new URL(request.url).searchParams.get("id"));

  const barber = await prisma.$transaction(async (tx) => {
    const existingBarber = await tx.barber.findUnique({
      where: { id },
      include: { person: true },
    });

    await tx.schedule.deleteMany({ where: { barberId: id } });
    await tx.barber.delete({ where: { id } });
    await tx.person.delete({ where: { id: existingBarber!.personId } });

    return existingBarber;
  });

  return NextResponse.json({ message: "Парикмахер удален", barber });
}
