"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../tabs.css";

interface Appointment {
  id: number;
  date: string;
  status: string;
  client: { person: { firstName: string; lastName: string } };
  barber: { person: { firstName: string; lastName: string } };
  service: { name: string; price: number; duration: number };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    client: "",
    barber: "",
    service: "",
    dateFrom: "",
    dateTo: "",
  });
  const [clientInput, setClientInput] = useState("");
  const [barberInput, setBarberInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("status", "pending");
      if (filters.client) params.append("client", filters.client);
      if (filters.barber) params.append("barber", filters.barber);
      if (filters.service) params.append("service", filters.service);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const res = await fetch(`/api/appointments?${params.toString()}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilterChange = (field: string, value: string) => {
    if (field !== "client" && field !== "barber" && field !== "service") {
      setFilters((prev) => ({ ...prev, [field]: value }));
    }
  };

  const applyClientFilter = () =>
    setFilters((prev) => ({ ...prev, client: clientInput }));
  const applyBarberFilter = () =>
    setFilters((prev) => ({ ...prev, barber: barberInput }));
  const applyServiceFilter = () =>
    setFilters((prev) => ({ ...prev, service: serviceInput }));

  const handleClientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyClientFilter();
  };
  const handleClientBlur = () => applyClientFilter();
  const handleBarberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyBarberFilter();
  };
  const handleBarberBlur = () => applyBarberFilter();
  const handleServiceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyServiceFilter();
  };
  const handleServiceBlur = () => applyServiceFilter();

  const resetFilters = () => {
    setFilters({
      client: "",
      barber: "",
      service: "",
      dateFrom: "",
      dateTo: "",
    });
    setClientInput("");
    setBarberInput("");
    setServiceInput("");
  };

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
          fetchAppointments();
          router.push("/works");
        } else alert("Ошибка");
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
          fetchAppointments();
        } else alert("Ошибка");
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
            <div className="filter-group">
              <label>Клиент</label>
              <input
                type="text"
                placeholder="Введите ФИО клиента..."
                value={clientInput}
                onChange={(e) => setClientInput(e.target.value)}
                onKeyDown={handleClientKeyDown}
                onBlur={handleClientBlur}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Парикмахер</label>
              <input
                type="text"
                placeholder="Введите ФИО парикмахера..."
                value={barberInput}
                onChange={(e) => setBarberInput(e.target.value)}
                onKeyDown={handleBarberKeyDown}
                onBlur={handleBarberBlur}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Услуга</label>
              <input
                type="text"
                placeholder="Введите название услуги..."
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={handleServiceKeyDown}
                onBlur={handleServiceBlur}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Дата от</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Дата до</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
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
                  <td className="text-center">
                    {new Date(a.date).toLocaleString("ru-RU")}
                  </td>
                  <td className="text-left">
                    {a.client.person.lastName} {a.client.person.firstName}
                  </td>
                  <td className="text-left">
                    {a.barber.person.lastName} {a.barber.person.firstName}
                  </td>
                  <td className="text-left">{a.service.name}</td>
                  <td className="text-center">{a.service.duration} мин</td>
                  <td className="text-center">{a.service.price} ₽</td>
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
