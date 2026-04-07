"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../tabs.css";
import { formatDateTime } from "@/helpers/format";
import type { Appointment } from "@/types";

interface AppointmentWithDiscount extends Appointment {
  finalPrice?: number;
}

const getFullName = (person: { firstName: string; lastName: string }) =>
  `${person.lastName} ${person.firstName}`;

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentWithDiscount[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    client: "",
    barber: "",
    service: "",
    dateFrom: "",
    dateTo: "",
  });

  const [filterInputs, setFilterInputs] = useState({
    client: "",
    barber: "",
    service: "",
  });

  const applyFilter = (field: "client" | "barber" | "service") => {
    setFilters((prev) => ({ ...prev, [field]: filterInputs[field] }));
  };

  const handleKeyDown =
    (field: "client" | "barber" | "service") => (e: React.KeyboardEvent) => {
      if (e.key === "Enter") applyFilter(field);
    };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: "pending" });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await fetch(`/api/appointments?${params}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const resetFilters = () => {
    setFilters({
      client: "",
      barber: "",
      service: "",
      dateFrom: "",
      dateTo: "",
    });
    setFilterInputs({ client: "", barber: "", service: "" });
  };

  const updateStatus = async (
    id: number,
    status: "completed" | "cancelled",
    message: string
  ) => {
    if (!confirm(message)) return;
    try {
      const res = await fetch(`/api/appointments?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        alert(status === "completed" ? "Запись выполнена" : "Запись отменена");
        fetchAppointments();
        if (status === "completed") router.push("/works");
      } else alert("Ошибка");
    } catch {
      alert("Ошибка");
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Активные записи</h1>
        <div className="header-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-filter"
          >
            🔍 Фильтры {showFilters ? "▲" : "▼"}
          </button>
          <Link href="/appointments/create" className="btn btn-primary">
            + Новая запись
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {[
              {
                label: "Клиент",
                field: "client" as const,
                placeholder: "Введите ФИО клиента...",
              },
              {
                label: "Парикмахер",
                field: "barber" as const,
                placeholder: "Введите ФИО парикмахера...",
              },
              {
                label: "Услуга",
                field: "service" as const,
                placeholder: "Введите название услуги...",
              },
            ].map(({ label, field, placeholder }) => (
              <div key={field} className="filter-group">
                <label>{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={filterInputs[field]}
                  onChange={(e) =>
                    setFilterInputs((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  onKeyDown={handleKeyDown(field)}
                  onBlur={() => applyFilter(field)}
                  className="filter-input"
                />
              </div>
            ))}
            <div className="filter-group">
              <label>Дата от</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Дата до</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className="filter-input"
              />
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
                  {Object.values(filters).some((v) => v)
                    ? "Ничего не найдено"
                    : "Нет активных записей"}
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id}>
                  <td className="text-center">{formatDateTime(a.date)}</td>
                  <td className="text-left">{getFullName(a.client.person)}</td>
                  <td className="text-left">{getFullName(a.barber.person)}</td>
                  <td className="text-left">{a.service.name}</td>
                  <td className="text-center">{a.service.duration} мин</td>
                  <td className="text-center">
                    {a.finalPrice !== undefined ? (
                      <>
                        <span
                          style={{
                            textDecoration: a.client.discount
                              ? "line-through"
                              : "none",
                            fontSize: "0.85rem",
                            color: "#999",
                          }}
                        >
                          {a.service.price} ₽
                        </span>
                        {a.client.discount ? (
                          <div style={{ color: "#4CAF50", fontWeight: "bold" }}>
                            {Math.round(a.finalPrice)} ₽{" "}
                            <span style={{ fontSize: "0.7rem" }}>
                              (скидка {a.client.discount}%)
                            </span>
                          </div>
                        ) : (
                          <div>{a.service.price} ₽</div>
                        )}
                      </>
                    ) : (
                      `${a.service.price} ₽`
                    )}
                  </td>
                  <td className="action-buttons">
                    <button
                      onClick={() =>
                        updateStatus(
                          a.id,
                          "completed",
                          "Отметить как выполненную?"
                        )
                      }
                      className="btn-success"
                    >
                      ✓ Выполнено
                    </button>
                    <button
                      onClick={() =>
                        updateStatus(a.id, "cancelled", "Отменить запись?")
                      }
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
