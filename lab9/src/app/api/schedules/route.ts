import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get("barberId");

  const schedules = await prisma.schedule.findMany({
    where: barberId ? { barberId: Number(barberId) } : {},
    include: {
      barber: { include: { person: true } },
    },
    orderBy: [{ barberId: "asc" }, { dayOfWeek: "asc" }],
  });

  return NextResponse.json(schedules);
}

export async function POST(request: NextRequest) {
  const { barberId, dayOfWeek, startTime, endTime, isDayOff } =
    await request.json();

  const schedule = await prisma.schedule.create({
    data: {
      barberId: Number(barberId),
      dayOfWeek: Number(dayOfWeek),
      startTime: startTime || null,
      endTime: endTime || null,
      isDayOff: isDayOff || false,
    },
    include: {
      barber: { include: { person: true } },
    },
  });

  return NextResponse.json(schedule, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = Number(new URL(request.url).searchParams.get("id"));

  await prisma.schedule.delete({ where: { id } });

  return NextResponse.json({ message: "Расписание удалено" });
}
