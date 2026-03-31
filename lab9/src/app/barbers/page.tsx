"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Barber } from "@/types";
import "../tabs.css";

interface Schedule {
  id: number;
  barberId: number;
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
  isDayOff: boolean;
}

const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

export default function BarbersPage() {
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [schedules, setSchedules] = useState<Record<number, Schedule[]>>({});
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState<number | null>(null);

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const [barbersRes, schedulesRes] = await Promise.all([
        fetch("/api/barbers"),
        fetch("/api/schedules"),
      ]);

      const barbersData = await barbersRes.json();
      const schedulesData = await schedulesRes.json();

      setBarbers(barbersData);

      const grouped = schedulesData.reduce(
        (acc: Record<number, Schedule[]>, s: Schedule) => {
          if (!acc[s.barberId]) acc[s.barberId] = [];
          acc[s.barberId].push(s);
          return acc;
        },
        {}
      );

      setSchedules(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScheduleText = (barberId: number) => {
    const barberSchedule = schedules[barberId] || [];
    if (barberSchedule.length === 0) return "Не указано";
    const workingDays = barberSchedule.filter((s) => !s.isDayOff);
    if (workingDays.length === 0) return "Выходные все дни";
    return `${workingDays.length} рабочих дней`;
  };

  const handleAddDay = (barberId: number) => {
    router.push(`/schedules/create?barberId=${barberId}`);
  };

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
              <th>Расписание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {barbers.map((b) => {
              const barberSchedules = schedules[b.id] || [];
              const existingDays = barberSchedules.map((s) => s.dayOfWeek);

              return (
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
                  <td>
                    <span className="badge badge-info">
                      {getScheduleText(b.id)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        setShowSchedule(showSchedule === b.id ? null : b.id)
                      }
                      className="btn btn-sm"
                      style={{
                        background: "#2563eb",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        border: "none",
                        borderRadius: "0.375rem",
                      }}
                    >
                      {showSchedule === b.id ? "Скрыть" : "Показать"}
                    </button>
                    <button
                      onClick={() => handleAddDay(b.id)}
                      className="btn btn-sm"
                      style={{
                        background: "#10b981",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        fontSize: "0.75rem",
                        marginLeft: "0.5rem",
                        cursor: "pointer",
                        border: "none",
                        borderRadius: "0.375rem",
                      }}
                    >
                      + день
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Модальное окно с расписанием */}
      {showSchedule && (
        <div className="modal-overlay" onClick={() => setShowSchedule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Расписание -{" "}
                {barbers.find((b) => b.id === showSchedule)?.person.lastName}{" "}
                {barbers.find((b) => b.id === showSchedule)?.person.firstName}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowSchedule(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {schedules[showSchedule]?.length > 0 ? (
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>День</th>
                      <th>Время</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules[showSchedule]
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((s) => (
                        <tr key={s.id}>
                          <td>{days[s.dayOfWeek - 1]}</td>
                          <td>
                            {s.isDayOff
                              ? "-"
                              : `${s.startTime || "-"} - ${s.endTime || "-"}`}
                          </td>
                          <td>
                            {s.isDayOff ? (
                              <span className="badge badge-warning">
                                Выходной
                              </span>
                            ) : (
                              <span className="badge badge-success">
                                Рабочий
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p>Расписание не указано. Нажмите "+ день" чтобы добавить</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => handleAddDay(showSchedule)}
                className="btn btn-primary"
              >
                + Добавить день
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
