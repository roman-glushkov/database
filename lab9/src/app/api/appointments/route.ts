import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET - список записей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const barberId = searchParams.get("barberId");
    const date = searchParams.get("date");

    const where: Prisma.AppointmentWhereInput = {};

    if (status) where.status = status;
    if (barberId) where.barberId = parseInt(barberId);
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: { include: { person: true } },
        barber: { include: { person: true } },
        service: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки записей" },
      { status: 500 }
    );
  }
}

// POST - создание записи
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, barberId, serviceId, date } = body;

    if (!clientId || !barberId || !serviceId || !date) {
      return NextResponse.json(
        { error: "Все поля обязательны" },
        { status: 400 }
      );
    }

    // Проверяем, свободен ли парикмахер в это время
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId: parseInt(barberId),
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "pending",
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "У парикмахера уже есть запись на это время" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: parseInt(clientId),
        barberId: parseInt(barberId),
        serviceId: parseInt(serviceId),
        date: appointmentDate,
        status: "pending",
      },
      include: {
        client: { include: { person: true } },
        barber: { include: { person: true } },
        service: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Ошибка при создании записи" },
      { status: 500 }
    );
  }
}

// PUT - обновление статуса записи (выполнено/отмена)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID и статус обязательны" },
        { status: 400 }
      );
    }

    // Получаем запись до удаления
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        barber: true,
        service: true,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
    }

    // Если статус "completed" - создаем запись в Work
    if (status === "completed") {
      await prisma.work.create({
        data: {
          clientId: existingAppointment.clientId,
          barberId: existingAppointment.barberId,
          serviceId: existingAppointment.serviceId,
          workDate: existingAppointment.date,
        },
      });
    }

    // Удаляем запись из Appointment (независимо от статуса)
    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      message:
        status === "completed"
          ? "Запись выполнена и перенесена в работы"
          : "Запись отменена",
      success: true,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении записи" },
      { status: 500 }
    );
  }
}
