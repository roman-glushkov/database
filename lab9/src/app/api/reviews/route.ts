import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
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
      orderBy: {
        reviewDate: "desc",
      },
    });

    if (client) {
      const clientLower = client.toLowerCase();
      reviews = reviews.filter((review) => {
        const fullName = `${review.work.client.person.lastName} ${
          review.work.client.person.firstName
        } ${review.work.client.person.middleName || ""}`.toLowerCase();
        return fullName.includes(clientLower);
      });
    }

    if (barber) {
      const barberLower = barber.toLowerCase();
      reviews = reviews.filter((review) => {
        const fullName =
          `${review.work.barber.person.lastName} ${review.work.barber.person.firstName}`.toLowerCase();
        return fullName.includes(barberLower);
      });
    }

    if (service) {
      const serviceLower = service.toLowerCase();
      reviews = reviews.filter((review) =>
        review.work.service.name.toLowerCase().includes(serviceLower)
      );
    }

    if (rating) {
      reviews = reviews.filter((review) => review.rating === parseInt(rating));
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
      reviews = reviews.filter(
        (review) => new Date(review.reviewDate) <= toDate
      );
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки отзывов" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workId, rating, text } = body;

    if (!workId || !rating) {
      return NextResponse.json(
        { error: "Работа и оценка обязательны" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        workId: parseInt(workId),
        rating: parseInt(rating),
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
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Ошибка при создании отзыва" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID отзыва обязателен" },
        { status: 400 }
      );
    }

    const reviewId = parseInt(id);

    const review = await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: "Отзыв удален", review });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении отзыва" },
      { status: 500 }
    );
  }
}
