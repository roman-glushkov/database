"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../forms.css";

export default function CreateBarberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    birthDate: "",
    phone: "",
    email: "",
    experience: "",
    specialization: "",
  });

  const fields = [
    {
      name: "firstName",
      label: "Имя",
      type: "text",
      required: true,
      placeholder: "Введите имя",
    },
    {
      name: "lastName",
      label: "Фамилия",
      type: "text",
      required: true,
      placeholder: "Введите фамилию",
    },
    {
      name: "middleName",
      label: "Отчество",
      type: "text",
      placeholder: "Введите отчество",
    },
    { name: "birthDate", label: "Дата рождения", type: "date" },
    {
      name: "phone",
      label: "Телефон",
      type: "tel",
      placeholder: "+7 (999) 123-45-67",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "example@mail.com",
    },
    {
      name: "experience",
      label: "Опыт (лет)",
      type: "number",
      placeholder: "Например: 5",
      min: "0",
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/barbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Парикмахер успешно добавлен!");
        router.push("/barbers");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert("Ошибка при добавлении парикмахера");
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
        <h1 className="form-title">Добавить парикмахера</h1>
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
              />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Специализация</label>
            <textarea
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Например: мужские стрижки, окрашивание"
              rows={3}
            />
          </div>
          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Добавление..." : "Добавить парикмахера"}
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
