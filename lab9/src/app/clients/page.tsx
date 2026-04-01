"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Client } from "@/types";
import "../tabs.css";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (
    id: number,
    lastName: string,
    firstName: string
  ) => {
    if (
      confirm(
        `Удалить клиента ${lastName} ${firstName}? Все его записи также будут удалены.`
      )
    ) {
      try {
        const res = await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("Клиент удален");
          fetchClients();
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
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td className="text-left">
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
                <td className="action-buttons">
                  <Link
                    href={`/clients/update?id=${c.id}`}
                    className="btn-edit"
                  >
                    ✏️
                  </Link>
                  <button
                    onClick={() =>
                      handleDelete(c.id, c.person.lastName, c.person.firstName)
                    }
                    className="btn-delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
