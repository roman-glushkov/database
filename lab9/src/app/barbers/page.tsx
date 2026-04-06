"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Barber, Schedule } from "@/types";
import { getFullName, formatDate, formatPhone } from "@/helpers/format";
import {
  days,
  experienceOptions,
  specializationOptions,
  scheduleOptions,
} from "@/helpers/constants";
import "../tabs.css";

export default function BarbersPage() {
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [schedules, setSchedules] = useState<Record<number, Schedule[]>>({});
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState<number | null>(null);
  const [showCertificates, setShowCertificates] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    fio: "",
    experience: "",
    specialization: "",
    schedule: "",
  });
  const [fioInput, setFioInput] = useState("");

  const applyFioFilter = () =>
    setFilters((prev) => ({ ...prev, fio: fioInput }));
  const handleFioKeyDown = (e: React.KeyboardEvent) =>
    e.key === "Enter" && applyFioFilter();

  const parseCertificates = (certificates: string | null) => {
    if (!certificates) return null;
    try {
      const parsed = JSON.parse(certificates);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      return [certificates];
    }
  };

  const getScheduleText = (barberId: number) => {
    const barberSchedule = schedules[barberId] || [];
    if (barberSchedule.length === 0) return "Не указано";
    const workingDays = barberSchedule.filter((s) => !s.isDayOff);
    if (workingDays.length === 0) return "Выходные все дни";
    return `${workingDays.length} рабочих дней`;
  };

  const fetchBarbers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(
        ([key, value]) => value && params.append(key, value)
      );

      const [barbersRes, schedulesRes] = await Promise.all([
        fetch(`/api/barbers?${params}`),
        fetch("/api/schedules"),
      ]);

      const barbersData = await barbersRes.json();
      const schedulesData = await schedulesRes.json();

      setBarbers(Array.isArray(barbersData) ? barbersData : []);

      const grouped = (
        Array.isArray(schedulesData) ? schedulesData : []
      ).reduce((acc: Record<number, Schedule[]>, s: Schedule) => {
        if (!acc[s.barberId]) acc[s.barberId] = [];
        acc[s.barberId].push(s);
        return acc;
      }, {});
      setSchedules(grouped);
    } catch {
      setBarbers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  const resetFilters = () => {
    setFilters({ fio: "", experience: "", specialization: "", schedule: "" });
    setFioInput("");
  };

  const handleDelete = async (
    id: number,
    lastName: string,
    firstName: string
  ) => {
    if (!confirm(`Удалить парикмахера ${lastName} ${firstName}?`)) return;
    try {
      const res = await fetch(`/api/barbers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Парикмахер удален");
        fetchBarbers();
      } else alert("Ошибка при удалении");
    } catch {
      alert("Ошибка при удалении");
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Парикмахеры</h1>
        <div className="header-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-filter"
          >
            🔍 Фильтры {showFilters ? "▲" : "▼"}
          </button>
          <Link href="/barbers/create" className="btn btn-primary">
            + Добавить
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>ФИО</label>
              <input
                type="text"
                placeholder="Введите ФИО... (Enter для поиска)"
                value={fioInput}
                onChange={(e) => setFioInput(e.target.value)}
                onKeyDown={handleFioKeyDown}
                onBlur={applyFioFilter}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Опыт (лет)</label>
              <select
                value={filters.experience}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, experience: e.target.value }))
                }
                className="filter-select"
              >
                <option value="">Все</option>
                {experienceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Специализация</label>
              <select
                value={filters.specialization}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, specialization: e.target.value }))
                }
                className="filter-select"
              >
                <option value="">Все</option>
                {specializationOptions.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>График</label>
              <select
                value={filters.schedule}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, schedule: e.target.value }))
                }
                className="filter-select"
              >
                <option value="">Все</option>
                {scheduleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="filters-actions">
            <button onClick={resetFilters} className="btn-reset">
              Сбросить все
            </button>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Дата рождения</th>
              <th>Телефон</th>
              <th>Опыт</th>
              <th>Специализация</th>
              <th>Сертификаты</th>
              <th>Расписание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {barbers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  {Object.values(filters).some((v) => v)
                    ? "Ничего не найдено"
                    : "Нет парикмахеров"}
                </td>
              </tr>
            ) : (
              barbers.map((b) => {
                const certificates = parseCertificates(b.certificates);
                const hasCertificates = certificates && certificates.length > 0;
                return (
                  <tr key={b.id}>
                    <td className="text-left">{getFullName(b.person)}</td>
                    <td className="text-center">
                      {formatDate(b.person.birthDate)}
                    </td>
                    <td className="text-center">
                      {formatPhone(b.person.phone)}
                    </td>
                    <td className="text-center">
                      {b.experience ? `${b.experience} лет` : "-"}
                    </td>
                    <td className="text-center">{b.specialization || "-"}</td>
                    <td className="text-center">
                      {hasCertificates ? (
                        <button
                          onClick={() => setShowCertificates(b.id)}
                          className="btn-certificate"
                        >
                          📜 {certificates.length}
                        </button>
                      ) : (
                        <span className="badge badge-warning">Нет</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => setShowSchedule(b.id)}
                        className="btn-schedule-link"
                      >
                        <span className="badge badge-info schedule-badge">
                          {getScheduleText(b.id)}
                        </span>
                      </button>
                    </td>
                    <td className="action-buttons">
                      <Link
                        href={`/barbers/update?id=${b.id}`}
                        className="btn-edit"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(
                            b.id,
                            b.person.lastName,
                            b.person.firstName
                          )
                        }
                        className="btn-delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно расписания */}
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
                <p>
                  Расписание не указано. Нажмите редактировать чтобы добавить
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() =>
                  router.push(`/schedules/create?barberId=${showSchedule}`)
                }
                className="btn btn-primary"
              >
                Редактировать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно сертификатов */}
      {showCertificates && (
        <div
          className="modal-overlay"
          onClick={() => setShowCertificates(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Сертификаты -{" "}
                {
                  barbers.find((b) => b.id === showCertificates)?.person
                    .lastName
                }{" "}
                {
                  barbers.find((b) => b.id === showCertificates)?.person
                    .firstName
                }
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowCertificates(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {(() => {
                const barber = barbers.find((b) => b.id === showCertificates);
                const certificates = parseCertificates(
                  barber?.certificates || null
                );
                if (!certificates || certificates.length === 0)
                  return <p>Нет сертификатов</p>;
                return (
                  <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                    {certificates.map((cert: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: "0.5rem" }}>
                        {cert}
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowCertificates(null)}
                className="btn btn-secondary"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
