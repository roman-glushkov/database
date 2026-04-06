"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Service } from "@/types";
import "../tabs.css";

const categoriesList = [
  "Мужские стрижки",
  "Женские стрижки",
  "Окрашивание",
  "Укладка",
  "Стрижка + укладка",
  "Коррекция бровей",
  "Лечение волос",
  "Уходовые процедуры",
  "Наращивание волос",
  "Химическая завивка",
  "Вечерние прически",
  "Свадебные прически",
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    name: "",
    category: "",
    price: "",
    popularity: "",
  });
  const [nameInput, setNameInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append("name", filters.name);
      if (filters.category) params.append("category", filters.category);
      if (filters.price) params.append("price", filters.price);
      if (filters.popularity) params.append("popularity", filters.popularity);

      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleFilterChange = (field: string, value: string) => {
    if (field !== "name") setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyNameFilter = () =>
    setFilters((prev) => ({ ...prev, name: nameInput }));
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyNameFilter();
  };
  const handleNameBlur = () => applyNameFilter();

  const resetFilters = () => {
    setFilters({ name: "", category: "", price: "", popularity: "" });
    setNameInput("");
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      confirm(
        `Удалить услугу "${name}"? Все записи с этой услугой также будут удалены.`
      )
    ) {
      try {
        const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("Услуга удалена");
          fetchServices();
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
        <h1 className="tabs-title">Услуги</h1>
        <div className="header-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-filter"
          >
            🔍 Фильтры {showFilters ? "▲" : "▼"}
          </button>
          <Link href="/services/create" className="btn btn-primary">
            + Добавить
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Название</label>
              <input
                type="text"
                placeholder="Введите название... (Enter для поиска)"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleNameBlur}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Категория</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="filter-select"
              >
                <option value="">Все</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Цена</label>
              <select
                value={filters.price}
                onChange={(e) => handleFilterChange("price", e.target.value)}
                className="filter-select"
              >
                <option value="">Все</option>
                <option value="0-500">До 500 ₽</option>
                <option value="500-1000">500-1000 ₽</option>
                <option value="1000-2000">1000-2000 ₽</option>
                <option value="2000+">От 2000 ₽</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Популярность</label>
              <select
                value={filters.popularity}
                onChange={(e) =>
                  handleFilterChange("popularity", e.target.value)
                }
                className="filter-select"
              >
                <option value="">Все</option>
                <option value="0">Нет выполнений</option>
                <option value="1-5">1-5 раз</option>
                <option value="5-10">5-10 раз</option>
                <option value="10+">10+ раз</option>
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
              <th>Название</th>
              <th>Длительность</th>
              <th>Цена</th>
              <th>Категория</th>
              <th>Выполнено</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  {Object.values(filters).some((v) => v)
                    ? "Ничего не найдено"
                    : "Нет услуг"}
                </td>
              </tr>
            ) : (
              services.map((s) => (
                <tr key={s.id}>
                  <td className="text-left">{s.name}</td>
                  <td className="text-center">
                    {s.duration ? `${s.duration} мин` : "-"}
                  </td>
                  <td className="text-center">{s.price} ₽</td>
                  <td className="text-center">{s.category || "-"}</td>
                  <td className="text-center">{s._count?.works || 0}</td>
                  <td className="action-buttons">
                    <Link
                      href={`/services/update?id=${s.id}`}
                      className="btn-edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
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
