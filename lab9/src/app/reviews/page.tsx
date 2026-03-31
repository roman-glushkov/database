"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Review } from "@/types";
import "../tabs.css";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Отзывы</h1>
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
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
