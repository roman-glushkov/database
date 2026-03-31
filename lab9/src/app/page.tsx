"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Stats } from "@/types";

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: "Парикмахеры",
      value: stats?.barbersCount || 0,
      color: "blue",
      link: "/barbers",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    {
      title: "Клиенты",
      value: stats?.clientsCount || 0,
      color: "green",
      link: "/clients",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
    {
      title: "Услуги",
      value: stats?.servicesCount || 0,
      color: "purple",
      link: "/services",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      title: "Выполнено работ",
      value: stats?.worksCount || 0,
      color: "orange",
      link: "/works",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
  ];

  const quickActions = [
    {
      title: "➕ Добавить парикмахера",
      desc: "Зарегистрируйте нового мастера",
      link: "/barbers/create",
      color: "blue",
    },
    {
      title: "👤 Добавить клиента",
      desc: "Внесите нового клиента в базу",
      link: "/clients/create",
      color: "green",
    },
    {
      title: "✂️ Добавить услугу",
      desc: "Расширьте прайс-лист салона",
      link: "/services/create",
      color: "purple",
    },
  ];

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="container">
      <div className="home-header">
        <h1>Парикмахерская Hair & Now</h1>
        <p>Управление парикмахерами, клиентами и услугами</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.title} className={`stat-card stat-${card.color}`}>
            <div className="stat-card-content">
              <span>{card.title}</span>
              <strong>{card.value}</strong>
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d={card.icon} />
            </svg>
            <Link href={card.link}>Подробнее →</Link>
          </div>
        ))}
      </div>

      <div className="actions-grid">
        {quickActions.map((action) => (
          <div
            key={action.title}
            className={`action-card action-${action.color}`}
          >
            <h3>{action.title}</h3>
            <p>{action.desc}</p>
            <Link href={action.link}>Добавить →</Link>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <h2>Последние записи</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Клиент</th>
                <th>Парикмахер</th>
                <th>Услуга</th>
                <th>Цена</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentWorks && stats.recentWorks.length > 0 ? (
                stats.recentWorks.map((work) => (
                  <tr key={work.id}>
                    <td>
                      {new Date(work.workDate).toLocaleDateString("ru-RU")}
                    </td>
                    <td>
                      {work.client?.person?.firstName}{" "}
                      {work.client?.person?.lastName}
                    </td>
                    <td>
                      {work.barber?.person?.firstName}{" "}
                      {work.barber?.person?.lastName}
                    </td>
                    <td>{work.service?.name}</td>
                    <td>{work.service?.price} ₽</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>Нет выполненных работ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Link href="/works">Показать все записи →</Link>
      </div>
    </div>
  );
}
