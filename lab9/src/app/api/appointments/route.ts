import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET - список записей с фильтрацией
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const barberId = searchParams.get("barberId");
    const client = searchParams.get("client") || "";
    const barber = searchParams.get("barber") || "";
    const service = searchParams.get("service") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    let where: Prisma.AppointmentWhereInput = { status: "pending" };
    if (status === "all") where = {};
    else if (status) where.status = status;
    if (barberId) where.barberId = parseInt(barberId);

    let appointments = await prisma.appointment.findMany({
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

    // Фильтрация по клиенту
    if (client) {
      const clientLower = client.toLowerCase();
      appointments = appointments.filter((app) => {
        const fullName = `${app.client.person.lastName} ${
          app.client.person.firstName
        } ${app.client.person.middleName || ""}`.toLowerCase();
        return fullName.includes(clientLower);
      });
    }

    // Фильтрация по парикмахеру
    if (barber) {
      const barberLower = barber.toLowerCase();
      appointments = appointments.filter((app) => {
        const fullName =
          `${app.barber.person.lastName} ${app.barber.person.firstName}`.toLowerCase();
        return fullName.includes(barberLower);
      });
    }

    // Фильтрация по услуге
    if (service) {
      const serviceLower = service.toLowerCase();
      appointments = appointments.filter((app) =>
        app.service.name.toLowerCase().includes(serviceLower)
      );
    }

    // Фильтрация по диапазону дат
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      appointments = appointments.filter(
        (app) => new Date(app.date) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      appointments = appointments.filter((app) => new Date(app.date) <= toDate);
    }

    // Добавляем цену со скидкой
    const appointmentsWithDiscount = appointments.map((app) => ({
      ...app,
      finalPrice: app.service.price * (1 - (app.client.discount || 0) / 100),
    }));

    return NextResponse.json(appointmentsWithDiscount);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки записей" },
      { status: 500 }
    );
  }
}

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

    // Добавляем цену со скидкой
    const appointmentWithDiscount = {
      ...appointment,
      finalPrice:
        appointment.service.price *
        (1 - (appointment.client.discount || 0) / 100),
    };

    return NextResponse.json(appointmentWithDiscount, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Ошибка при создании записи" },
      { status: 500 }
    );
  }
}

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
