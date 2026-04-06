"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { serviceFields } from "@/helpers/constants";
import { specializationOptions } from "@/helpers/constants";
import { ServiceFormData, ServiceFormProps } from "@/helpers/types";

const defaultFormData: ServiceFormData = {
  name: "",
  duration: "",
  price: "",
  category: "",
};

export default function ServiceForm({
  mode,
  serviceId,
  initialData,
}: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>(
    initialData || defaultFormData
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        mode === "create" ? "/api/services" : `/api/services/${serviceId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(
          mode === "create"
            ? "Услуга успешно добавлена!"
            : "Услуга успешно обновлена!"
        );
        router.push("/services");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert(
        `Ошибка при ${mode === "create" ? "добавлении" : "обновлении"} услуги`
      );
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
        <h1 className="form-title">
          {mode === "create" ? "Добавить услугу" : "Редактировать услугу"}
        </h1>
        <form onSubmit={handleSubmit}>
          {serviceFields.map((field) => (
            <div key={field.name} className="form-group">
              <label className="form-label">
                {field.label} {field.required && "*"}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof ServiceFormData]}
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
              {specializationOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? mode === "create"
                  ? "Добавление..."
                  : "Сохранение..."
                : mode === "create"
                ? "Добавить услугу"
                : "Сохранить изменения"}
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
