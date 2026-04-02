import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id },
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

    if (!review) {
      return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Ошибка загрузки отзыва" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { rating, text } = body;

    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        rating: rating !== undefined ? parseInt(rating) : existingReview.rating,
        text: text !== undefined ? text : existingReview.text,
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

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении отзыва" },
      { status: 500 }
    );
  }
}
