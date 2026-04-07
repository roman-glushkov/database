"use client";

import { useEffect, useState } from "react";
import "../tabs.css";
import { formatMoney, avgPrice } from "@/helpers/format";
import type {
  BarberStats,
  ServiceStats,
  ClientStats,
  MonthlyStats,
} from "@/types";

const tabs = [
  { id: "barbers", label: "👨‍🦰 Парикмахеры" },
  { id: "services", label: "✂️ Услуги" },
  { id: "clients", label: "👥 Клиенты" },
  { id: "monthly", label: "📅 По месяцам" },
];

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

  // Подсчет общей статистики по скидкам
  const totalOriginal = clientStats.reduce(
    (sum, c) => sum + (c.totalOriginal || 0),
    0
  );
  const totalSpent = clientStats.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalSaved = totalOriginal - totalSpent;
  const clientsWithDiscount = clientStats.filter(
    (c) => (c.discount || 0) > 0
  ).length;

  if (loading) return <div className="loading">Загрузка аналитики...</div>;

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1 className="tabs-title">Аналитика</h1>
      </div>

      <div className="analytics-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`analytics-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
                  <td className="text-center">{formatMoney(b.totalRevenue)}</td>
                  <td className="text-center">
                    {avgPrice(b.totalRevenue, b.workCount)}
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <td className="text-left">
                  <strong>ИТОГО</strong>
                </td>
                <td className="text-center">
                  <strong>
                    {barberStats.reduce((s, b) => s + b.workCount, 0)}
                  </strong>
                </td>
                <td className="text-center">
                  <strong>
                    {formatMoney(
                      barberStats.reduce((s, b) => s + b.totalRevenue, 0)
                    )}
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
                  <td className="text-center">{formatMoney(s.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "clients" && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Скидка</th>
                <th>Визитов</th>
                <th>Без скидки</th>
                <th>Со скидкой</th>
                <th>Сэкономлено</th>
                <th>Средний чек</th>
              </tr>
            </thead>
            <tbody>
              {clientStats.map((c) => (
                <tr key={c.id}>
                  <td className="text-left">{c.name}</td>
                  <td className="text-center">
                    {c.discount ? (
                      <span style={{ color: "#10b981", fontWeight: "bold" }}>
                        {c.discount}%
                      </span>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>-</span>
                    )}
                  </td>
                  <td className="text-center">{c.visitCount}</td>
                  <td
                    className="text-center"
                    style={{ textDecoration: "line-through", color: "#9ca3af" }}
                  >
                    {formatMoney(c.totalOriginal || c.totalSpent)}
                  </td>
                  <td
                    className="text-center"
                    style={{ fontWeight: "bold", color: "#10b981" }}
                  >
                    {formatMoney(c.totalSpent)}
                  </td>
                  <td className="text-center" style={{ color: "#ef4444" }}>
                    -{formatMoney(c.totalSaved || 0)}
                  </td>
                  <td className="text-center">
                    {avgPrice(c.totalSpent, c.visitCount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f3f4f6", fontWeight: "bold" }}>
                <td className="text-left">ИТОГО</td>
                <td className="text-center">-</td>
                <td className="text-center">
                  {clientStats.reduce((s, c) => s + c.visitCount, 0)}
                </td>
                <td className="text-center">{formatMoney(totalOriginal)}</td>
                <td className="text-center">{formatMoney(totalSpent)}</td>
                <td className="text-center" style={{ color: "#ef4444" }}>
                  -{formatMoney(totalSaved)}
                </td>
                <td className="text-center">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

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
                    <td className="text-center">{formatMoney(m.revenue)}</td>
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
