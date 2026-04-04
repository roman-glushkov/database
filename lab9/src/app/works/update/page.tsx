"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Barber, Client, Service } from "@/types";
import "../../forms.css";

export default function UpdateWorkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    clientId: "",
    barberId: "",
    serviceId: "",
    workDate: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/barbers").then((res) => res.json()),
      fetch("/api/clients").then((res) => res.json()),
      fetch("/api/services").then((res) => res.json()),
    ])
      .then(([barbersData, clientsData, servicesData]) => {
        setBarbers(barbersData);
        setClients(clientsData);
        setServices(servicesData);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!workId) {
      setFetching(false);
      setError("Работа не выбрана");
      return;
    }

    fetch(`/api/works/${workId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then((data) => {
        setFormData({
          clientId: data.clientId?.toString() || "",
          barberId: data.barberId?.toString() || "",
          serviceId: data.serviceId?.toString() || "",
          workDate: data.workDate ? data.workDate.split("T")[0] : "",
        });
        setFetching(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Ошибка загрузки данных");
        setFetching(false);
      });
  }, [workId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/works/${workId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Работа успешно обновлена!");
        router.push("/works");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert("Ошибка при обновлении работы");
    } finally {
      setLoading(false);
    }
  };

  if (!workId) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/works" className="btn-back">
            ← Назад к списку
          </Link>
          <div className="loading">Работа не выбрана</div>
        </div>
      </div>
    );
  }

  if (fetching) return <div className="loading">Загрузка...</div>;

  if (error) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/works" className="btn-back">
            ← Назад к списку
          </Link>
          <div className="loading">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <Link href="/works" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">Редактировать работу</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Клиент *</label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Выберите клиента</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.person.lastName} {c.person.firstName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Парикмахер *</label>
            <select
              name="barberId"
              value={formData.barberId}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Выберите парикмахера</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.person.lastName} {b.person.firstName} (
                  {b.specialization || "любая"})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Услуга *</label>
            <select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Выберите услугу</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.price} ₽ ({s.duration} мин)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Дата выполнения *</label>
            <input
              type="date"
              name="workDate"
              value={formData.workDate}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/works")}
              className="btn-cancel"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
