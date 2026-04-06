"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Schedule } from "@/types";
import { days } from "@/helpers/constants";
import { getFullName } from "@/helpers/format";
import "../tabs.css";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedules")
      .then((res) => res.json())
      .then(setSchedules)
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
                  <td>{getFullName(s.barber.person)}</td>
                  <td>{days[s.dayOfWeek - 1]}</td>
                  <td>
                    {s.isDayOff
                      ? "Выходной"
                      : `${s.startTime || "-"} - ${s.endTime || "-"}`}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${
                        s.isDayOff ? "warning" : "success"
                      }`}
                    >
                      {s.isDayOff ? "Выходной" : "Рабочий"}
                    </span>
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
