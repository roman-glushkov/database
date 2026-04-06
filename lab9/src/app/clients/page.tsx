"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Client } from "@/types";
import { getFullName, formatDate, formatPhone } from "@/helpers/format";
import { discountOptions, visitsOptions } from "@/helpers/constants";
import "../tabs.css";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ fio: "", discount: "", visits: "" });
  const [fioInput, setFioInput] = useState("");

  const applyFioFilter = () =>
    setFilters((prev) => ({ ...prev, fio: fioInput }));
  const handleFioKeyDown = (e: React.KeyboardEvent) =>
    e.key === "Enter" && applyFioFilter();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(
        ([key, value]) => value && params.append(key, value)
      );
      const res = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const resetFilters = () => {
    setFilters({ fio: "", discount: "", visits: "" });
    setFioInput("");
  };

  const handleDelete = async (
    id: number,
    lastName: string,
    firstName: string
  ) => {
    if (
      !confirm(
        `Удалить клиента ${lastName} ${firstName}? Все его записи также будут удалены.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Клиент удален");
        fetchClients();
      } else alert("Ошибка при удалении");
    } catch {
      alert("Ошибка при удалении");
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Клиенты</h1>
        <div className="header-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-filter"
          >
            🔍 Фильтры {showFilters ? "▲" : "▼"}
          </button>
          <Link href="/clients/create" className="btn btn-primary">
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
              <label>Скидка (%)</label>
              <select
                value={filters.discount}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, discount: e.target.value }))
                }
                className="filter-select"
              >
                <option value="">Все</option>
                {discountOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Количество визитов</label>
              <select
                value={filters.visits}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, visits: e.target.value }))
                }
                className="filter-select"
              >
                <option value="">Все</option>
                {visitsOptions.map((opt) => (
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
              <th>Скидка</th>
              <th>Первый визит</th>
              <th>Визитов</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  {Object.values(filters).some((v) => v)
                    ? "Ничего не найдено"
                    : "Нет клиентов"}
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id}>
                  <td className="text-left">{getFullName(c.person)}</td>
                  <td className="text-center">
                    {formatDate(c.person.birthDate)}
                  </td>
                  <td className="text-center">{formatPhone(c.person.phone)}</td>
                  <td className="text-center">
                    {c.discount ? `${c.discount}%` : "-"}
                  </td>
                  <td className="text-center">{formatDate(c.firstVisit)}</td>
                  <td className="text-center">{c._count?.works || 0}</td>
                  <td className="action-buttons">
                    <Link
                      href={`/clients/update?id=${c.id}`}
                      className="btn-edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(
                          c.id,
                          c.person.lastName,
                          c.person.firstName
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
