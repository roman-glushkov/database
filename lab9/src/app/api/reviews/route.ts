import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
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
