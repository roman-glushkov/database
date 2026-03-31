"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "../tabs.css";

interface Schedule {
  id: number;
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
  isDayOff: boolean;
  barber: {
    person: {
      firstName: string;
      lastName: string;
    };
  };
}

const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedules")
      .then((res) => res.json())
      .then((data) => setSchedules(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Расписание</h1>
        <Link href="/schedules/create" className="btn btn-primary">
          + Добавить
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Парикмахер</th>
              <th>День</th>
              <th>Время работы</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">
                  Нет расписания
                </td>
              </tr>
            ) : (
              schedules.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.barber.person.lastName} {s.barber.person.firstName}
                  </td>
                  <td>{days[s.dayOfWeek - 1]}</td>
                  <td>
                    {s.isDayOff
                      ? "Выходной"
                      : `${s.startTime || "-"} - ${s.endTime || "-"}`}
                  </td>
                  <td>
                    {s.isDayOff ? (
                      <span className="badge badge-warning">Выходной</span>
                    ) : (
                      <span className="badge badge-success">Рабочий</span>
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
