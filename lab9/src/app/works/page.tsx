"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Work } from "@/types";
import "../tabs.css";

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/works")
      .then((res) => res.json())
      .then((data) => setWorks(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Выполненные работы</h1>
        {/* Убрали кнопку + Добавить */}
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Клиент</th>
              <th>Парикмахер</th>
              <th>Услуга</th>
              <th>Цена</th>
              <th>Отзыв</th>
            </tr>
          </thead>
          <tbody>
            {works.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Нет выполненных работ
                </td>
              </tr>
            ) : (
              works.map((w) => (
                <tr key={w.id}>
                  <td>{new Date(w.workDate).toLocaleDateString("ru-RU")}</td>
                  <td>
                    {w.client.person.lastName} {w.client.person.firstName}
                  </td>
                  <td>
                    {w.barber.person.lastName} {w.barber.person.firstName}
                  </td>
                  <td>{w.service.name}</td>
                  <td>{w.service.price} ₽</td>
                  <td>
                    {w.review ? (
                      <span className="badge badge-success">
                        ⭐ {w.review.rating}
                      </span>
                    ) : (
                      <Link
                        href={`/reviews/create?workId=${w.id}`}
                        className="btn-review"
                      >
                        + отзыв
                      </Link>
                    )}
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
