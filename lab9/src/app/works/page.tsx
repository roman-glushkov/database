"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Work } from "@/types";
import "../tabs.css";

export default function WorksPage() {
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorks = async () => {
    try {
      const res = await fetch("/api/works");
      const data = await res.json();
      setWorks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleDelete = async (
    id: number,
    clientName: string,
    serviceName: string
  ) => {
    if (confirm(`Удалить работу "${serviceName}" для клиента ${clientName}?`)) {
      try {
        const res = await fetch(`/api/works?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("Работа удалена");
          fetchWorks();
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
        <h1 className="tabs-title">Выполненные работы</h1>
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
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {works.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
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
                  <td className="action-buttons">
                    <Link
                      href={`/works/update?id=${w.id}`}
                      className="btn-edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(
                          w.id,
                          `${w.client.person.firstName} ${w.client.person.lastName}`,
                          w.service.name
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
