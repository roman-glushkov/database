"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Barber } from "@/types";
import "../tabs.css";

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/barbers")
      .then((res) => res.json())
      .then((data) => setBarbers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Парикмахеры</h1>
        <Link href="/barbers/create" className="btn btn-primary">
          + Добавить
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Дата рождения</th>
              <th>Телефон</th>
              <th>Опыт</th>
              <th>Специализация</th>
            </tr>
          </thead>
          <tbody>
            {barbers.map((b) => (
              <tr key={b.id}>
                <td>
                  {b.person.lastName} {b.person.firstName}{" "}
                  {b.person.middleName || ""}
                </td>
                <td>
                  {b.person.birthDate
                    ? new Date(b.person.birthDate).toLocaleDateString("ru-RU")
                    : "-"}
                </td>
                <td>{b.person.phone || "-"}</td>
                <td>{b.experience ? `${b.experience} лет` : "-"}</td>
                <td>{b.specialization || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
