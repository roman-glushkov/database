"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Service } from "@/types";
import "../tabs.css";

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (
      confirm(
        `Удалить услугу "${name}"? Все записи с этой услугой также будут удалены.`
      )
    ) {
      try {
        const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("Услуга удалена");
          fetchServices();
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
        <h1 className="tabs-title">Услуги</h1>
        <Link href="/services/create" className="btn btn-primary">
          + Добавить
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Длительность</th>
              <th>Цена</th>
              <th>Категория</th>
              <th>Выполнено</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Нет услуг
                </td>
              </tr>
            ) : (
              services.map((s) => (
                <tr key={s.id}>
                  <td className="text-left">{s.name}</td>
                  <td>{s.duration ? `${s.duration} мин` : "-"}</td>
                  <td>{s.price} ₽</td>
                  <td>{s.category || "-"}</td>
                  <td>{s._count?.works || 0}</td>
                  <td className="action-buttons">
                    <Link
                      href={`/services/update?id=${s.id}`}
                      className="btn-edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
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
