"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Client } from "@/types";
import "../tabs.css";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Фильтры
  const [filters, setFilters] = useState({
    fio: "",
    discount: "",
    visits: "",
  });
  const [fioInput, setFioInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.fio) params.append("fio", filters.fio);
      if (filters.discount) params.append("discount", filters.discount);
      if (filters.visits) params.append("visits", filters.visits);

      const res = await fetch(`/api/clients?${params.toString()}`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [filters]);

  const handleFilterChange = (field: string, value: string) => {
    if (field !== "fio") {
      setFilters((prev) => ({ ...prev, [field]: value }));
    }
  };

  const applyFioFilter = () => {
    setFilters((prev) => ({ ...prev, fio: fioInput }));
  };

  const handleFioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFioFilter();
    }
  };

  const handleFioBlur = () => {
    applyFioFilter();
  };

  const resetFilters = () => {
    setFilters({
      fio: "",
      discount: "",
      visits: "",
    });
    setFioInput("");
  };

  const handleDelete = async (
    id: number,
    lastName: string,
    firstName: string
  ) => {
    if (
      confirm(
        `Удалить клиента ${lastName} ${firstName}? Все его записи также будут удалены.`
      )
    ) {
      try {
        const res = await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("Клиент удален");
          fetchClients();
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

      {/* Панель фильтров */}
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
                onBlur={handleFioBlur}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Скидка (%)</label>
              <select
                value={filters.discount}
                onChange={(e) => handleFilterChange("discount", e.target.value)}
                className="filter-select"
              >
                <option value="">Все</option>
                <option value="0">0%</option>
                <option value="1-10">1-10%</option>
                <option value="11-20">11-20%</option>
                <option value="20+">20%+</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Количество визитов</label>
              <select
                value={filters.visits}
                onChange={(e) => handleFilterChange("visits", e.target.value)}
                className="filter-select"
              >
                <option value="">Все</option>
                <option value="0">Нет визитов</option>
                <option value="1-3">1-3 визита</option>
                <option value="4-10">4-10 визитов</option>
                <option value="10+">10+ визитов</option>
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
                  <td className="text-left">
                    {c.person.lastName} {c.person.firstName}{" "}
                    {c.person.middleName || ""}
                  </td>
                  <td className="text-center">
                    {c.person.birthDate
                      ? new Date(c.person.birthDate).toLocaleDateString("ru-RU")
                      : "-"}
                  </td>
                  <td className="text-center">{c.person.phone || "-"}</td>
                  <td className="text-center">
                    {c.discount ? `${c.discount}%` : "-"}
                  </td>
                  <td className="text-center">
                    {c.firstVisit
                      ? new Date(c.firstVisit).toLocaleDateString("ru-RU")
                      : "-"}
                  </td>
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
