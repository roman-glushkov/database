"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "../../forms.css";

const categories = [
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

export default function UpdateServicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    if (!serviceId) {
      setFetching(false);
      setError("Услуга не выбрана");
      return;
    }

    fetch(`/api/services/${serviceId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки");
        }
        return res.json();
      })
      .then((data) => {
        setFormData({
          name: data?.name || "",
          duration: data?.duration?.toString() || "",
          price: data?.price?.toString() || "",
          category: data?.category || "",
        });
        setFetching(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Ошибка загрузки данных");
        setFetching(false);
      });
  }, [serviceId]);

  const fields = [
    {
      name: "name",
      label: "Название",
      type: "text",
      required: true,
      placeholder: "Например: Мужская стрижка",
    },
    {
      name: "duration",
      label: "Длительность (мин)",
      type: "number",
      placeholder: "30",
      min: "0",
    },
    {
      name: "price",
      label: "Цена",
      type: "number",
      required: true,
      placeholder: "1000",
      min: "0",
      step: "0.01",
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Услуга успешно обновлена!");
        router.push("/services");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert("Ошибка при обновлении услуги");
    } finally {
      setLoading(false);
    }
  };

  if (!serviceId) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/services" className="btn-back">
            ← Назад к списку
          </Link>
          <div className="loading">Услуга не выбрана</div>
        </div>
      </div>
    );
  }

  if (fetching) return <div className="loading">Загрузка...</div>;

  if (error) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/services" className="btn-back">
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
        <Link href="/services" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">Редактировать услугу</h1>

        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name} className="form-group">
              <label className="form-label">
                {field.label} {field.required && "*"}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                required={field.required || false}
                className="form-input"
                placeholder={field.placeholder}
                min={field.min}
                step={field.step}
              />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Категория</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/services")}
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
