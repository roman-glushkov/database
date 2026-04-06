"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ReviewForm from "@/components/ReviewForm";
import { Review } from "@/types";
import "../../forms.css";

export default function UpdateReviewPage() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("id");
  const [initialData, setInitialData] = useState<{
    workId: string;
    rating: string;
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reviews/${reviewId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then((data: Review) => {
        setInitialData({
          workId: data.workId.toString(),
          rating: data.rating.toString(),
          text: data.text || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Отзыв не найден");
        setLoading(false);
      });
  }, [reviewId]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="loading">{error}</div>;
  if (!initialData) return <div className="loading">Отзыв не выбран</div>;

  return (
    <ReviewForm mode="update" reviewId={reviewId} initialData={initialData} />
  );
}
