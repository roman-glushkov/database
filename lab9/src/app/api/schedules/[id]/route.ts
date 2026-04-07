import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scheduleId = Number(id);
  const { startTime, endTime, isDayOff } = await request.json();

  const schedule = await prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      startTime: startTime ?? null,
      endTime: endTime ?? null,
      isDayOff: isDayOff ?? false,
    },
  });

  return NextResponse.json(schedule);
}
