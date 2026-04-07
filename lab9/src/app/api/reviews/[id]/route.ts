import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviewId = Number(id);

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
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
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviewId = Number(id);
  const { rating, text } = await request.json();

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: rating !== undefined ? Number(rating) : undefined,
      text: text !== undefined ? text : undefined,
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
}
