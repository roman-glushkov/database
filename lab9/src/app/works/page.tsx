"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Work } from "@/types";
import "../tabs.css";

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
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

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.client) params.append("client", filters.client);
      if (filters.barber) params.append("barber", filters.barber);
      if (filters.service) params.append("service", filters.service);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const res = await fetch(`/api/works?${params.toString()}`);
      const data = await res.json();
      setWorks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

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

  const handleDelete = async (
    id: number,
    clientName: string,
    serviceName: string
  ) => {
    if (confirm(`Удалить работу "${serviceName}" для клиента ${clientName}?`)) {
      try {
        const res = await fetch(`/api/works?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("Работа удалена");
          fetchWorks();
        } else alert("Ошибка при удалении");
      } catch {
        alert("Ошибка при удалении");
      }
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Выполненные работы</h1>
        <div className="header-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-filter"
          >
            🔍 Фильтры {showFilters ? "▲" : "▼"}
          </button>
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
              <th>Дата</th>
              <th>Клиент</th>
              <th>Парикмахер</th>
              <th>Услуга</th>
              <th>Цена</th>
              <th>Отзыв</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {works.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  {Object.values(filters).some((v) => v)
                    ? "Ничего не найдено"
                    : "Нет выполненных работ"}
                </td>
              </tr>
            ) : (
              works.map((w) => (
                <tr key={w.id}>
                  <td className="text-center">
                    {new Date(w.workDate).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="text-left">
                    {w.client.person.lastName} {w.client.person.firstName}
                  </td>
                  <td className="text-left">
                    {w.barber.person.lastName} {w.barber.person.firstName}
                  </td>
                  <td className="text-left">{w.service.name}</td>
                  <td className="text-center">{w.service.price} ₽</td>
                  <td className="text-center">
                    {w.review ? (
                      <span className="badge badge-success">
                        ⭐ {w.review.rating}
                      </span>
                    ) : (
                      <Link
                        href={`/reviews/create?workId=${w.id}`}
                        className="btn-review"
                      >
                        + отзыв
                      </Link>
                    )}
                  </td>
                  <td className="action-buttons">
                    <Link
                      href={`/works/update?id=${w.id}`}
                      className="btn-edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(
                          w.id,
                          `${w.client.person.firstName} ${w.client.person.lastName}`,
                          w.service.name
                        )
                      }
                      className="btn-delete"
                    >
                      🗑️
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
