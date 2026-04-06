"use client";

import { useEffect, useState } from "react";
import "../tabs.css";

interface BarberStats {
  id: number;
  name: string;
  workCount: number;
  totalRevenue: number;
}

interface ServiceStats {
  id: number;
  name: string;
  workCount: number;
  totalRevenue: number;
  category: string;
}

interface ClientStats {
  id: number;
  name: string;
  visitCount: number;
  totalSpent: number;
}

interface MonthlyStats {
  month: string;
  workCount: number;
  revenue: number;
}

export default function AnalyticsPage() {
  const [barberStats, setBarberStats] = useState<BarberStats[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("barbers");

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/barbers").then((res) => res.json()),
      fetch("/api/analytics/services").then((res) => res.json()),
      fetch("/api/analytics/clients").then((res) => res.json()),
      fetch("/api/analytics/monthly").then((res) => res.json()),
    ])
      .then(([barbers, services, clients, monthly]) => {
        setBarberStats(barbers);
        setServiceStats(services);
        setClientStats(clients);
        setMonthlyStats(monthly);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="loading">Загрузка аналитики...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Аналитика</h1>
      </div>

      {/* Вкладки */}
      <div className="analytics-tabs">
        <button
          className={`analytics-tab ${activeTab === "barbers" ? "active" : ""}`}
          onClick={() => setActiveTab("barbers")}
        >
          👨‍🦰 Парикмахеры
        </button>
        <button
          className={`analytics-tab ${
            activeTab === "services" ? "active" : ""
          }`}
          onClick={() => setActiveTab("services")}
        >
          ✂️ Услуги
        </button>
        <button
          className={`analytics-tab ${activeTab === "clients" ? "active" : ""}`}
          onClick={() => setActiveTab("clients")}
        >
          👥 Клиенты
        </button>
        <button
          className={`analytics-tab ${activeTab === "monthly" ? "active" : ""}`}
          onClick={() => setActiveTab("monthly")}
        >
          📅 По месяцам
        </button>
      </div>

      {/* Парикмахеры */}
      {activeTab === "barbers" && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Парикмахер</th>
                <th>Количество работ</th>
                <th>Выручка</th>
                <th>Средний чек</th>
              </tr>
            </thead>
            <tbody>
              {barberStats.map((b) => (
                <tr key={b.id}>
                  <td className="text-left">{b.name}</td>
                  <td className="text-center">{b.workCount}</td>
                  <td className="text-center">
                    {b.totalRevenue.toLocaleString()} ₽
                  </td>
                  <td className="text-center">
                    {Math.round(b.totalRevenue / b.workCount).toLocaleString()}{" "}
                    ₽
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <td className="text-left">
                  <strong>ИТОГО</strong>
                </td>
                <td className="text-center">
                  <strong>
                    {barberStats.reduce((sum, b) => sum + b.workCount, 0)}
                  </strong>
                </td>
                <td className="text-center">
                  <strong>
                    {barberStats
                      .reduce((sum, b) => sum + b.totalRevenue, 0)
                      .toLocaleString()}{" "}
                    ₽
                  </strong>
                </td>
                <td className="text-center">
                  <strong>-</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Услуги */}
      {activeTab === "services" && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Категория</th>
                <th>Количество выполнений</th>
                <th>Выручка</th>
              </tr>
            </thead>
            <tbody>
              {serviceStats.map((s) => (
                <tr key={s.id}>
                  <td className="text-left">{s.name}</td>
                  <td className="text-center">{s.category}</td>
                  <td className="text-center">{s.workCount}</td>
                  <td className="text-center">
                    {s.totalRevenue.toLocaleString()} ₽
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Клиенты */}
      {activeTab === "clients" && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Количество визитов</th>
                <th>Потрачено всего</th>
                <th>Средний чек</th>
                <th>Скидка</th>
              </tr>
            </thead>
            <tbody>
              {clientStats.map((c) => (
                <tr key={c.id}>
                  <td className="text-left">{c.name}</td>
                  <td className="text-center">{c.visitCount}</td>
                  <td className="text-center">
                    {c.totalSpent.toLocaleString()} ₽
                  </td>
                  <td className="text-center">
                    {Math.round(c.totalSpent / c.visitCount).toLocaleString()} ₽
                  </td>
                  <td className="text-center">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* По месяцам */}
      {activeTab === "monthly" && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Месяц</th>
                <th>Количество работ</th>
                <th>Выручка</th>
                <th>Динамика</th>
              </tr>
            </thead>
            <tbody>
              {monthlyStats.map((m, idx) => {
                let change = null;
                let isPositive = true;

                if (idx > 0) {
                  const prevRevenue = monthlyStats[idx - 1].revenue;
                  const prevWorkCount = monthlyStats[idx - 1].workCount;

                  if (prevRevenue > 0) {
                    change = (
                      ((m.revenue - prevRevenue) / prevRevenue) *
                      100
                    ).toFixed(1);
                    isPositive = parseFloat(change) >= 0;
                  } else {
                    change = "∞";
                    isPositive = true;
                  }
                }

                return (
                  <tr key={m.month}>
                    <td className="text-left">{m.month}</td>
                    <td className="text-center">{m.workCount}</td>
                    <td className="text-center">
                      {m.revenue.toLocaleString()} ₽
                    </td>
                    <td className="text-center">
                      {idx === 0 ? (
                        <span className="badge badge-info">Базовый</span>
                      ) : (
                        <span
                          style={{ color: isPositive ? "#10b981" : "#ef4444" }}
                        >
                          {isPositive ? "↑" : "↓"} {change}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
