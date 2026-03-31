"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../forms.css";

// Предопределенные категории
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

export default function CreateServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    price: "",
    category: "",
  });

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
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Услуга успешно добавлена!");
        router.push("/services");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert("Ошибка при добавлении услуги");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <Link href="/services" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">Добавить услугу</h1>
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

          {/* Select для категории */}
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
              {loading ? "Добавление..." : "Добавить услугу"}
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
