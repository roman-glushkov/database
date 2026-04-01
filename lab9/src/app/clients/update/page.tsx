"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "../../forms.css";

export default function UpdateClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("id");

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
    discount: "",
  });

  useEffect(() => {
    if (!clientId) {
      setFetching(false);
      setError("Клиент не выбран");
      return;
    }

    fetch(`/api/clients/${clientId}`)
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
          discount: data?.discount?.toString() || "",
        });
        setFetching(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Ошибка загрузки данных");
        setFetching(false);
      });
  }, [clientId]);

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
      name: "discount",
      label: "Скидка (%)",
      type: "number",
      placeholder: "Например: 10",
      min: "0",
      max: "100",
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Клиент успешно обновлен!");
        router.push("/clients");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert("Ошибка при обновлении клиента");
    } finally {
      setLoading(false);
    }
  };

  if (!clientId) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/clients" className="btn-back">
            ← Назад к списку
          </Link>
          <div className="loading">Клиент не выбран</div>
        </div>
      </div>
    );
  }

  if (fetching) return <div className="loading">Загрузка...</div>;

  if (error) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/clients" className="btn-back">
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
        <Link href="/clients" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">Редактировать клиента</h1>

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
                max={field.max}
              />
            </div>
          ))}

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/clients")}
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
