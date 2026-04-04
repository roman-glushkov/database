"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../tabs.css";

interface Appointment {
  id: number;
  date: string;
  status: string;
  client: {
    person: { firstName: string; lastName: string };
  };
  barber: {
    person: { firstName: string; lastName: string };
  };
  service: {
    name: string;
    price: number;
    duration: number;
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleComplete = async (id: number) => {
    if (
      confirm(
        "Отметить запись как выполненную? Она переместится в выполненные работы."
      )
    ) {
      try {
        const res = await fetch(`/api/appointments?id=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        });
        if (res.ok) {
          alert("Запись выполнена и перенесена в работы");
          fetchAppointments(); // обновляем список (запись уже удалена)
          router.push("/works");
        } else {
          alert("Ошибка");
        }
      } catch {
        alert("Ошибка");
      }
    }
  };

  const handleCancel = async (id: number) => {
    if (confirm("Отменить запись?")) {
      try {
        const res = await fetch(`/api/appointments?id=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        });
        if (res.ok) {
          alert("Запись отменена");
          fetchAppointments(); // обновляем список (запись удалена)
        } else {
          alert("Ошибка");
        }
      } catch {
        alert("Ошибка");
      }
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Активные записи</h1>
        <Link href="/appointments/create" className="btn btn-primary">
          + Новая запись
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Дата и время</th>
              <th>Клиент</th>
              <th>Парикмахер</th>
              <th>Услуга</th>
              <th>Длительность</th>
              <th>Цена</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  Нет активных записей
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.date).toLocaleString("ru-RU")}</td>
                  <td>
                    {a.client.person.lastName} {a.client.person.firstName}
                  </td>
                  <td>
                    {a.barber.person.lastName} {a.barber.person.firstName}
                  </td>
                  <td>{a.service.name}</td>
                  <td>{a.service.duration} мин</td>
                  <td>{a.service.price} ₽</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => handleComplete(a.id)}
                      className="btn-success"
                    >
                      ✓ Выполнено
                    </button>
                    <button
                      onClick={() => handleCancel(a.id)}
                      className="btn-danger"
                    >
                      ✗ Отмена
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
