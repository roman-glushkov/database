"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Work } from "@/types";
import { formatDate, getFullName, formatMoney } from "@/helpers/format";
import "../tabs.css";

// Расширенный тип Work с finalPrice
interface WorkWithDiscount extends Work {
  finalPrice?: number;
}

export default function WorksPage() {
  const [works, setWorks] = useState<WorkWithDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
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

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await fetch(`/api/works?${params}`);
      const data = await res.json();
      setWorks(Array.isArray(data) ? data : []);
    } catch {
      setWorks([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const applyFilter = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyClientFilter = () => applyFilter("client", clientInput);
  const applyBarberFilter = () => applyFilter("barber", barberInput);
  const applyServiceFilter = () => applyFilter("service", serviceInput);

  const handleKeyDown = (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") callback();
  };

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
                onKeyDown={handleKeyDown(applyClientFilter)}
                onBlur={applyClientFilter}
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
                onKeyDown={handleKeyDown(applyBarberFilter)}
                onBlur={applyBarberFilter}
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
                onKeyDown={handleKeyDown(applyServiceFilter)}
                onBlur={applyServiceFilter}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Дата от</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => applyFilter("dateFrom", e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Дата до</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => applyFilter("dateTo", e.target.value)}
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
                  {Object.values(filters).some(Boolean)
                    ? "Ничего не найдено"
                    : "Нет выполненных работ"}
                </td>
              </tr>
            ) : (
              works.map((w) => (
                <tr key={w.id}>
                  <td className="text-center">{formatDate(w.workDate)}</td>
                  <td className="text-left">{getFullName(w.client.person)}</td>
                  <td className="text-left">{getFullName(w.barber.person)}</td>
                  <td className="text-left">{w.service.name}</td>
                  <td className="text-center">
                    {w.finalPrice !== undefined ? (
                      <>
                        <span
                          style={{
                            textDecoration: w.client.discount
                              ? "line-through"
                              : "none",
                            fontSize: "0.85rem",
                            color: "#999",
                          }}
                        >
                          {formatMoney(w.service.price)}
                        </span>
                        {w.client.discount ? (
                          <div style={{ color: "#4CAF50", fontWeight: "bold" }}>
                            {formatMoney(w.finalPrice)}{" "}
                            <span style={{ fontSize: "0.7rem" }}>
                              (скидка {w.client.discount}%)
                            </span>
                          </div>
                        ) : (
                          <div>{formatMoney(w.service.price)}</div>
                        )}
                      </>
                    ) : (
                      formatMoney(w.service.price)
                    )}
                  </td>
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
                          getFullName(w.client.person),
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
