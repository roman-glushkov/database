import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";
  const barberId = searchParams.get("barberId");
  const client = searchParams.get("client") || "";
  const barber = searchParams.get("barber") || "";
  const service = searchParams.get("service") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const where: Prisma.AppointmentWhereInput = {};
  if (status !== "all") where.status = status;
  if (barberId) where.barberId = Number(barberId);

  let appointments = await prisma.appointment.findMany({
    where,
    include: {
      client: { include: { person: true } },
      barber: { include: { person: true } },
      service: true,
    },
    orderBy: { date: "asc" },
  });

  if (client) {
    const clientLower = client.toLowerCase();
    appointments = appointments.filter((app) =>
      `${app.client.person.lastName} ${app.client.person.firstName} ${
        app.client.person.middleName || ""
      }`
        .toLowerCase()
        .includes(clientLower)
    );
  }

  if (barber) {
    const barberLower = barber.toLowerCase();
    appointments = appointments.filter((app) =>
      `${app.barber.person.lastName} ${app.barber.person.firstName}`
        .toLowerCase()
        .includes(barberLower)
    );
  }

  if (service) {
    const serviceLower = service.toLowerCase();
    appointments = appointments.filter((app) =>
      app.service.name.toLowerCase().includes(serviceLower)
    );
  }

  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    fromDate.setHours(0, 0, 0, 0);
    appointments = appointments.filter((app) => new Date(app.date) >= fromDate);
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    appointments = appointments.filter((app) => new Date(app.date) <= toDate);
  }

  const appointmentsWithDiscount = appointments.map((app) => ({
    ...app,
    finalPrice: app.service.price * (1 - (app.client.discount || 0) / 100),
  }));

  return NextResponse.json(appointmentsWithDiscount);
}

export async function POST(request: NextRequest) {
  const { clientId, barberId, serviceId, date } = await request.json();

  const appointmentDate = new Date(date);
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      barberId: Number(barberId),
      date: { gte: startOfDay, lte: endOfDay },
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
      clientId: Number(clientId),
      barberId: Number(barberId),
      serviceId: Number(serviceId),
      date: appointmentDate,
      status: "pending",
    },
    include: {
      client: { include: { person: true } },
      barber: { include: { person: true } },
      service: true,
    },
  });

  const appointmentWithDiscount = {
    ...appointment,
    finalPrice:
      appointment.service.price *
      (1 - (appointment.client.discount || 0) / 100),
  };

  return NextResponse.json(appointmentWithDiscount, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  const { status } = await request.json();

  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
    include: { client: true, barber: true, service: true },
  });

  if (status === "completed") {
    await prisma.work.create({
      data: {
        clientId: existingAppointment!.clientId,
        barberId: existingAppointment!.barberId,
        serviceId: existingAppointment!.serviceId,
        workDate: existingAppointment!.date,
      },
    });
  }

  await prisma.appointment.delete({ where: { id } });

  return NextResponse.json({
    message:
      status === "completed"
        ? "Запись выполнена и перенесена в работы"
        : "Запись отменена",
    success: true,
  });
}
