"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Service } from "@/types";
import {
  specializationOptions,
  priceOptions,
  popularityOptions,
} from "@/helpers/constants";
import { formatMoney } from "@/helpers/format";
import "../tabs.css";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    price: "",
    popularity: "",
  });
  const [nameInput, setNameInput] = useState("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await fetch(`/api/services?${params}`);
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const applyFilter = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyNameFilter = () => applyFilter("name", nameInput);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyNameFilter();
  };

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
                onKeyDown={handleKeyDown}
                onBlur={applyNameFilter}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Категория</label>
              <select
                value={filters.category}
                onChange={(e) => applyFilter("category", e.target.value)}
                className="filter-select"
              >
                <option value="">Все</option>
                {specializationOptions.map((cat) => (
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
                onChange={(e) => applyFilter("price", e.target.value)}
                className="filter-select"
              >
                {priceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Популярность</label>
              <select
                value={filters.popularity}
                onChange={(e) => applyFilter("popularity", e.target.value)}
                className="filter-select"
              >
                {popularityOptions.map((opt) => (
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
                  {Object.values(filters).some(Boolean)
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
                  <td className="text-center">{formatMoney(s.price)}</td>
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
