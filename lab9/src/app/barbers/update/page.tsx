"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "../../forms.css";

const specializations = [
  "Мужские стрижки",
  "Женские стрижки",
  "Окрашивание",
  "Укладка",
  "Коррекция бровей",
  "Лечение волос",
  "Уходовые процедуры",
  "Наращивание волос",
  "Химическая завивка",
  "Вечерние прически",
  "Свадебные прически",
];

export default function UpdateBarberPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barberId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    birthDate: "",
    phone: "",
    email: "",
    experience: "",
    specialization: "",
    certificates: "",
  });

  useEffect(() => {
    if (!barberId) {
      setFetching(false);
      setError("Парикмахер не выбран");
      return;
    }

    fetch(`/api/barbers/${barberId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки");
        }
        return res.json();
      })
      .then((data) => {
        setFormData({
          firstName: data?.person?.firstName || "",
          lastName: data?.person?.lastName || "",
          middleName: data?.person?.middleName || "",
          birthDate: data?.person?.birthDate
            ? data.person.birthDate.split("T")[0]
            : "",
          phone: data?.person?.phone || "",
          email: data?.person?.email || "",
          experience: data?.experience?.toString() || "",
          specialization: data?.specialization || "",
          certificates: data?.certificates || "",
        });
        setFetching(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Ошибка загрузки данных");
        setFetching(false);
      });
  }, [barberId]);

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
      let certificatesData = null;
      if (formData.certificates.trim()) {
        try {
          certificatesData = JSON.parse(formData.certificates);
        } catch {
          certificatesData = formData.certificates;
        }
      }

      const res = await fetch(`/api/barbers/${barberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          certificates: certificatesData
            ? JSON.stringify(certificatesData)
            : null,
        }),
      });

      if (res.ok) {
        alert("Парикмахер успешно обновлен!");
        router.push("/barbers");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert("Ошибка при обновлении парикмахера");
    } finally {
      setLoading(false);
    }
  };

  if (!barberId) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/barbers" className="btn-back">
            ← Назад к списку
          </Link>
          <div className="loading">Парикмахер не выбран</div>
        </div>
      </div>
    );
  }

  if (fetching) return <div className="loading">Загрузка...</div>;

  if (error) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/barbers" className="btn-back">
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
        <Link href="/barbers" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">Редактировать парикмахера</h1>

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
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Выберите специализацию</option>
              {specializations.map((spec) => (
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
            <small
              style={{
                color: "#6b7280",
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                display: "block",
              }}
            >
              Можно ввести как JSON массив, так и обычный текст
            </small>
          </div>

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Сохранение..." : "Сохранить изменения"}
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
