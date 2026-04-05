"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Review } from "@/types";
import "../tabs.css";

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Фильтры
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
  const [showFilters, setShowFilters] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.client) params.append("client", filters.client);
      if (filters.barber) params.append("barber", filters.barber);
      if (filters.service) params.append("service", filters.service);
      if (filters.rating) params.append("rating", filters.rating);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

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

      {/* Панель фильтров */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Клиент</label>
              <input
                type="text"
                placeholder="Введите ФИО клиента... (Enter для поиска)"
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
                placeholder="Введите ФИО парикмахера... (Enter для поиска)"
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
                placeholder="Введите название услуги... (Enter для поиска)"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={handleServiceKeyDown}
                onBlur={handleServiceBlur}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Оценка</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
                className="filter-select"
              >
                <option value="">Все</option>
                <option value="5">5 ★ - Отлично</option>
                <option value="4">4 ★ - Хорошо</option>
                <option value="3">3 ★ - Средне</option>
                <option value="2">2 ★ - Плохо</option>
                <option value="1">1 ★ - Ужасно</option>
              </select>
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
                  {Object.values(filters).some((v) => v)
                    ? "Ничего не найдено"
                    : "Нет отзывов"}
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id}>
                  <td className="text-left">
                    {r.work.client.person.lastName}{" "}
                    {r.work.client.person.firstName}
                  </td>
                  <td className="text-left">
                    {r.work.barber.person.lastName}{" "}
                    {r.work.barber.person.firstName}
                  </td>
                  <td className="text-left">{r.work.service.name}</td>
                  <td className="text-center">
                    <span className="badge badge-success">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </td>
                  <td
                    style={{ maxWidth: "300px", whiteSpace: "normal" }}
                    className="text-left"
                  >
                    {r.text || "-"}
                  </td>
                  <td className="text-center">
                    {new Date(r.reviewDate).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="action-buttons">
                    <Link
                      href={`/reviews/update?id=${r.id}`}
                      className="btn-edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(
                          r.id,
                          `${r.work.client.person.lastName} ${r.work.client.person.firstName}`
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
