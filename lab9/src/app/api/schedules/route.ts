import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get("barberId");

    const where = barberId ? { barberId: parseInt(barberId) } : {};

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        barber: {
          include: {
            person: true,
          },
        },
      },
      orderBy: [{ barberId: "asc" }, { dayOfWeek: "asc" }],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки расписания" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barberId, dayOfWeek, startTime, endTime, isDayOff } = body;

    if (!barberId || dayOfWeek === undefined) {
      return NextResponse.json(
        { error: "Парикмахер и день недели обязательны" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        barberId: parseInt(barberId),
        dayOfWeek: parseInt(dayOfWeek),
        startTime: startTime || null,
        endTime: endTime || null,
        isDayOff: isDayOff || false,
      },
      include: {
        barber: {
          include: {
            person: true,
          },
        },
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Ошибка при создании расписания" },
      { status: 500 }
    );
  }
}
