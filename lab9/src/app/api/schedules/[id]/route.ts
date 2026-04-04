import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { startTime, endTime, isDayOff } = body;

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        startTime: startTime || null,
        endTime: endTime || null,
        isDayOff: isDayOff || false,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении расписания" },
      { status: 500 }
    );
  }
}
