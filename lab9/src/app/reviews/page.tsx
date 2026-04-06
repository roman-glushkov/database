"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Review } from "@/types";
import { formatDate, getFullName, renderStars } from "@/helpers/format";
import { ratingOptions } from "@/helpers/constants";
import "../tabs.css";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    client: "",
    barber: "",
    service: "",
    rating: "",
    dateFrom: "",
    dateTo: "",
  });
  const [clientInput, setClientInput] = useState("");
  const [barberInput, setBarberInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const applyFilter = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      client: "",
      barber: "",
      service: "",
      rating: "",
      dateFrom: "",
      dateTo: "",
    });
    setClientInput("");
    setBarberInput("");
    setServiceInput("");
  };

  const handleDelete = async (id: number, clientName: string) => {
    if (confirm(`Удалить отзыв от ${clientName}?`)) {
      try {
        const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("Отзыв удален");
          fetchReviews();
        } else alert("Ошибка при удалении");
      } catch {
        alert("Ошибка при удалении");
      }
    }
  };

  const handleKeyDown = (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") callback();
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Отзывы</h1>
        <div className="header-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-filter"
          >
            🔍 Фильтры {showFilters ? "▲" : "▼"}
          </button>
          <Link href="/reviews/create" className="btn btn-primary">
            + Добавить
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
                onKeyDown={handleKeyDown(() =>
                  applyFilter("client", clientInput)
                )}
                onBlur={() => applyFilter("client", clientInput)}
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
                onKeyDown={handleKeyDown(() =>
                  applyFilter("barber", barberInput)
                )}
                onBlur={() => applyFilter("barber", barberInput)}
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
                onKeyDown={handleKeyDown(() =>
                  applyFilter("service", serviceInput)
                )}
                onBlur={() => applyFilter("service", serviceInput)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Оценка</label>
              <select
                value={filters.rating}
                onChange={(e) => applyFilter("rating", e.target.value)}
                className="filter-select"
              >
                {ratingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
              <th>Клиент</th>
              <th>Парикмахер</th>
              <th>Услуга</th>
              <th>Оценка</th>
              <th>Отзыв</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  {Object.values(filters).some(Boolean)
                    ? "Ничего не найдено"
                    : "Нет отзывов"}
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id}>
                  <td className="text-left">
                    {getFullName(r.work.client.person)}
                  </td>
                  <td className="text-left">
                    {getFullName(r.work.barber.person)}
                  </td>
                  <td className="text-left">{r.work.service.name}</td>
                  <td className="text-center">
                    <span className="badge badge-success">
                      {renderStars(r.rating)}
                    </span>
                  </td>
                  <td
                    style={{ maxWidth: "300px", whiteSpace: "normal" }}
                    className="text-left"
                  >
                    {r.text || "-"}
                  </td>
                  <td className="text-center">{formatDate(r.reviewDate)}</td>
                  <td className="action-buttons">
                    <Link
                      href={`/reviews/update?id=${r.id}`}
                      className="btn-edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(r.id, getFullName(r.work.client.person))
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
