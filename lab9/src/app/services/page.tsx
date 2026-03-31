"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Service } from "@/types";
import "../tabs.css";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  Нет услуг
                </td>
              </tr>
            ) : (
              services.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.duration ? `${s.duration} мин` : "-"}</td>
                  <td>{s.price} ₽</td>
                  <td>{s.category || "-"}</td>
                  <td>{s._count?.works || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
