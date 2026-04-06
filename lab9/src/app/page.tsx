"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Stats } from "@/types";

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // ✅ Без useEffect - через useState initializer (один раз при монтировании)
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: `${i * 0.5}s`,
      x: `${Math.random() * 100}%`,
      duration: `${5 + Math.random() * 10}s`,
    }))
  );

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const statCards = [
    {
      title: "Парикмахеры",
      value: stats?.barbersCount || 0,
      gradient: "gradient-blue",
      link: "/barbers",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          <path d="M18 9a3 3 0 100-6 3 3 0 000 6zM6 9a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      ),
      emoji: "💇",
    },
    {
      title: "Клиенты",
      value: stats?.clientsCount || 0,
      gradient: "gradient-green",
      link: "/clients",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      emoji: "👥",
    },
    {
      title: "Услуги",
      value: stats?.servicesCount || 0,
      gradient: "gradient-purple",
      link: "/services",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          <path d="M7 10L12 5M17 10L12 15" />
        </svg>
      ),
      emoji: "✂️",
    },
    {
      title: "Выполнено работ",
      value: stats?.worksCount || 0,
      gradient: "gradient-orange",
      link: "/works",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      emoji: "✨",
    },
  ];

  const quickActions = [
    {
      title: "Новый мастер",
      desc: "Добавьте парикмахера в команду",
      link: "/barbers/create",
      gradient: "gradient-blue",
      icon: "💈",
    },
    {
      title: "Новый клиент",
      desc: "Зарегистрируйте клиента",
      link: "/clients/create",
      gradient: "gradient-green",
      icon: "👤",
    },
    {
      title: "Новая услуга",
      desc: "Расширьте прайс-лист",
      link: "/services/create",
      gradient: "gradient-purple",
      icon: "💎",
    },
    {
      title: "Новая запись",
      desc: "Создайте бронирование",
      link: "/appointments/create",
      gradient: "gradient-orange",
      icon: "📅",
    },
  ];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-ring"></div>
          <div className="loading-spinner"></div>
          <p>Загрузка волшебства...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="particles-bg">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={
              {
                "--delay": particle.delay,
                "--x": particle.x,
                "--duration": particle.duration,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div
        className="mouse-glow"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      />

      <div className="hero-section" ref={heroRef}>
        <div className="hero-badge">
          <span className="badge-glow">✨ Салон премиум класса</span>
        </div>
        <h1 className="hero-title">
          Hair &<span className="gradient-text"> Now</span>
        </h1>
        <p className="hero-subtitle">
          Умное управление салоном красоты нового поколения
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">{stats?.barbersCount || 0}</span>
            <span className="hero-stat-label">Мастеров</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">{stats?.clientsCount || 0}</span>
            <span className="hero-stat-label">Клиентов</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">{stats?.worksCount || 0}</span>
            <span className="hero-stat-label">Работ</span>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="section-header">
          <span className="section-chip">Аналитика</span>
          <h2 className="section-title">Ключевые показатели</h2>
        </div>
        <div className="stats-grid">
          {statCards.map((card, idx) => (
            <Link
              href={card.link}
              key={card.title}
              className="stat-card-wrapper"
            >
              <div
                className={`stat-card ${card.gradient}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="stat-card-front">
                  <div className="stat-icon">{card.icon}</div>
                  <div className="stat-content">
                    <span className="stat-title">{card.title}</span>
                    <div className="stat-value-wrapper">
                      <span className="stat-emoji">{card.emoji}</span>
                      <strong className="stat-value">{card.value}</strong>
                    </div>
                  </div>
                  <div className="stat-arrow">→</div>
                </div>
                <div className="stat-card-back">
                  <span>Подробнее</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="actions-section">
        <div className="section-header">
          <span className="section-chip">Быстрые действия</span>
          <h2 className="section-title">Что нужно сделать?</h2>
        </div>
        <div className="actions-grid">
          {quickActions.map((action) => (
            <Link
              href={action.link}
              key={action.title}
              className="action-card-wrapper"
            >
              <div className={`action-card ${action.gradient}`}>
                <div className="action-icon">{action.icon}</div>
                <h3 className="action-title">{action.title}</h3>
                <p className="action-desc">{action.desc}</p>
                <div className="action-btn">
                  <span>Создать</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="recent-section">
        <div className="section-header">
          <span className="section-chip">Активность</span>
          <h2 className="section-title">Последние записи</h2>
        </div>
        <div className="recent-card">
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>📅 Дата</th>
                  <th>👤 Клиент</th>
                  <th>💇 Парикмахер</th>
                  <th>✂️ Услуга</th>
                  <th>💰 Цена</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentWorks && stats.recentWorks.length > 0 ? (
                  stats.recentWorks.map((work, idx) => (
                    <tr
                      key={work.id}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <td>
                        <div className="date-cell">
                          <span className="date-day">
                            {new Date(work.workDate).toLocaleDateString(
                              "ru-RU",
                              { day: "numeric" }
                            )}
                          </span>
                          <span className="date-month">
                            {new Date(work.workDate).toLocaleDateString(
                              "ru-RU",
                              { month: "short" }
                            )}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="client-cell">
                          <div className="client-avatar">
                            {work.client?.person?.firstName?.[0]}
                            {work.client?.person?.lastName?.[0]}
                          </div>
                          <span>
                            {work.client?.person?.firstName}{" "}
                            {work.client?.person?.lastName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="barber-cell">
                          <span>
                            {work.barber?.person?.firstName}{" "}
                            {work.barber?.person?.lastName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="service-tag">
                          {work.service?.name}
                        </span>
                      </td>
                      <td>
                        <div className="price-cell">
                          {work.service?.price} ₽
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <span>📭</span>
                        <p>Нет выполненных работ</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="recent-footer">
            <Link href="/works" className="view-all-btn">
              <span>Показать все записи</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
