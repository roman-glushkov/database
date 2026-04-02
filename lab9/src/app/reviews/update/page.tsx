"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Review } from "@/types";
import "../../forms.css";

export default function UpdateReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    rating: "5",
    text: "",
  });

  useEffect(() => {
    if (!reviewId) {
      setFetching(false);
      setError("Отзыв не выбран");
      return;
    }

    fetch(`/api/reviews/${reviewId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки");
        }
        return res.json();
      })
      .then((data: Review) => {
        setReview(data);
        setFormData({
          rating: data?.rating?.toString() || "5",
          text: data?.text || "",
        });
        setFetching(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Ошибка загрузки данных");
        setFetching(false);
      });
  }, [reviewId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Отзыв успешно обновлен!");
        router.push("/reviews");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert("Ошибка при обновлении отзыва");
    } finally {
      setLoading(false);
    }
  };

  if (!reviewId) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/reviews" className="btn-back">
            ← Назад к списку
          </Link>
          <div className="loading">Отзыв не выбран</div>
        </div>
      </div>
    );
  }

  if (fetching) return <div className="loading">Загрузка...</div>;

  if (error) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/reviews" className="btn-back">
            ← Назад к списку
          </Link>
          <div className="loading">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <Link href="/reviews" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">Редактировать отзыв</h1>

        {review && (
          <div
            style={{
              background: "#f3f4f6",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            <div>
              <strong>Клиент:</strong> {review.work.client.person.lastName}{" "}
              {review.work.client.person.firstName}
            </div>
            <div>
              <strong>Парикмахер:</strong> {review.work.barber.person.lastName}{" "}
              {review.work.barber.person.firstName}
            </div>
            <div>
              <strong>Услуга:</strong> {review.work.service.name} (
              {review.work.service.price} ₽)
            </div>
            <div>
              <strong>Дата работы:</strong>{" "}
              {new Date(review.work.workDate).toLocaleDateString("ru-RU")}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Оценка *</label>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <label
                  key={star}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={star}
                    checked={parseInt(formData.rating) === star}
                    onChange={handleChange}
                  />
                  <span
                    style={{
                      fontSize: "1.25rem",
                      color:
                        star <= parseInt(formData.rating)
                          ? "#f59e0b"
                          : "#d1d5db",
                    }}
                  >
                    {"★"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Отзыв</label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Расскажите о своем опыте..."
              rows={5}
            />
          </div>

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/reviews")}
              className="btn-cancel"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
