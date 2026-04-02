"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Review } from "@/types";
import "../tabs.css";

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: number, clientName: string) => {
    if (confirm(`Удалить отзыв от ${clientName}?`)) {
      try {
        const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("Отзыв удален");
          fetchReviews();
        } else {
          alert("Ошибка при удалении");
        }
      } catch {
        alert("Ошибка при удалении");
      }
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Отзывы</h1>
        <Link href="/reviews/create" className="btn btn-primary">
          + Добавить
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Клиент</th>
              <th>Парикмахер</th>
              <th>Услуга</th>
              <th>Оценка</th>
              <th>Отзыв</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  Нет отзывов
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.work.client.person.lastName}{" "}
                    {r.work.client.person.firstName}
                  </td>
                  <td>
                    {r.work.barber.person.lastName}{" "}
                    {r.work.barber.person.firstName}
                  </td>
                  <td>{r.work.service.name}</td>
                  <td>
                    <span className="badge badge-success">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </td>
                  <td style={{ maxWidth: "300px", whiteSpace: "normal" }}>
                    {r.text || "-"}
                  </td>
                  <td>{new Date(r.reviewDate).toLocaleDateString("ru-RU")}</td>
                  <td className="action-buttons">
                    <Link
                      href={`/reviews/update?id=${r.id}`}
                      className="btn-edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(
                          r.id,
                          `${r.work.client.person.lastName} ${r.work.client.person.firstName}`
                        )
                      }
                      className="btn-delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
