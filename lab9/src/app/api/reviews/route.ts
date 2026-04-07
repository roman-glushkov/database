import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const client = searchParams.get("client") || "";
  const barber = searchParams.get("barber") || "";
  const service = searchParams.get("service") || "";
  const rating = searchParams.get("rating") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  let reviews = await prisma.review.findMany({
    include: {
      work: {
        include: {
          client: { include: { person: true } },
          barber: { include: { person: true } },
          service: true,
        },
      },
    },
    orderBy: { reviewDate: "desc" },
  });

  if (client) {
    const clientLower = client.toLowerCase();
    reviews = reviews.filter((review) =>
      `${review.work.client.person.lastName} ${
        review.work.client.person.firstName
      } ${review.work.client.person.middleName || ""}`
        .toLowerCase()
        .includes(clientLower)
    );
  }

  if (barber) {
    const barberLower = barber.toLowerCase();
    reviews = reviews.filter((review) =>
      `${review.work.barber.person.lastName} ${review.work.barber.person.firstName}`
        .toLowerCase()
        .includes(barberLower)
    );
  }

  if (service) {
    const serviceLower = service.toLowerCase();
    reviews = reviews.filter((review) =>
      review.work.service.name.toLowerCase().includes(serviceLower)
    );
  }

  if (rating) {
    reviews = reviews.filter((review) => review.rating === Number(rating));
  }

  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    fromDate.setHours(0, 0, 0, 0);
    reviews = reviews.filter(
      (review) => new Date(review.reviewDate) >= fromDate
    );
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    reviews = reviews.filter((review) => new Date(review.reviewDate) <= toDate);
  }

  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  const { workId, rating, text } = await request.json();

  const review = await prisma.review.create({
    data: {
      workId: Number(workId),
      rating: Number(rating),
      text: text || null,
      reviewDate: new Date(),
    },
    include: {
      work: {
        include: {
          client: { include: { person: true } },
          barber: { include: { person: true } },
          service: true,
        },
      },
    },
  });

  return NextResponse.json(review, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = Number(new URL(request.url).searchParams.get("id"));

  const review = await prisma.review.delete({ where: { id } });

  return NextResponse.json({ message: "Отзыв удален", review });
}
