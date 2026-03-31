"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Client } from "@/types";
import "../tabs.css";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Клиенты</h1>
        <Link href="/clients/create" className="btn btn-primary">
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
              <th>Скидка</th>
              <th>Первый визит</th>
              <th>Визитов</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.person.lastName} {c.person.firstName}{" "}
                  {c.person.middleName || ""}
                </td>
                <td>
                  {c.person.birthDate
                    ? new Date(c.person.birthDate).toLocaleDateString("ru-RU")
                    : "-"}
                </td>
                <td>{c.person.phone || "-"}</td>
                <td>{c.discount ? `${c.discount}%` : "-"}</td>
                <td>
                  {c.firstVisit
                    ? new Date(c.firstVisit).toLocaleDateString("ru-RU")
                    : "-"}
                </td>
                <td>{c._count?.works || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
