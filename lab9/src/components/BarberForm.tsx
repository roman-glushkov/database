"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { specializationOptions, barberFields } from "@/helpers/constants";
import { parseCertificatesToJSON } from "@/helpers/timeSlots";

interface BarberFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  email: string;
  experience: string;
  specialization: string;
  certificates: string;
}

interface BarberFormProps {
  mode: "create" | "update";
  barberId?: string | null;
  initialData?: BarberFormData | null;
}

const defaultFormData: BarberFormData = {
  firstName: "",
  lastName: "",
  middleName: "",
  birthDate: "",
  phone: "",
  email: "",
  experience: "",
  specialization: "",
  certificates: "",
};

export default function BarberForm({
  mode,
  barberId,
  initialData,
}: BarberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BarberFormData>(
    initialData || defaultFormData
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const certificatesData = parseCertificatesToJSON(formData.certificates);
      const url =
        mode === "create" ? "/api/barbers" : `/api/barbers/${barberId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          certificates: certificatesData,
        }),
      });

      if (res.ok) {
        alert(
          mode === "create"
            ? "Парикмахер успешно добавлен!"
            : "Парикмахер успешно обновлен!"
        );
        router.push("/barbers");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert(
        `Ошибка при ${
          mode === "create" ? "добавлении" : "обновлении"
        } парикмахера`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <Link href="/barbers" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">
          {mode === "create"
            ? "Добавить парикмахера"
            : "Редактировать парикмахера"}
        </h1>
        <form onSubmit={handleSubmit}>
          {barberFields.map((field) => (
            <div key={field.name} className="form-group">
              <label className="form-label">
                {field.label} {field.required && "*"}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof BarberFormData]}
                onChange={handleChange}
                required={field.required || false}
                className="form-input"
                placeholder={field.placeholder}
                min={field.min}
              />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Специализация</label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Выберите специализацию</option>
              {specializationOptions.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Сертификаты</label>
            <textarea
              name="certificates"
              value={formData.certificates}
              onChange={handleChange}
              className="form-textarea"
              placeholder='["Лучший парикмахер 2023", "Мастер года"]'
              rows={3}
            />
            <small className="form-hint">
              Можно ввести как JSON массив, так и обычный текст
            </small>
          </div>

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? mode === "create"
                  ? "Добавление..."
                  : "Сохранение..."
                : mode === "create"
                ? "Добавить парикмахера"
                : "Сохранить изменения"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/barbers")}
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
