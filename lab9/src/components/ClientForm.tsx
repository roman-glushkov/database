"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clientFields } from "@/helpers/constants";

interface ClientFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  email: string;
  discount: string;
}

interface ClientFormProps {
  mode: "create" | "update";
  clientId?: string | null;
  initialData?: ClientFormData | null;
}

const defaultFormData: ClientFormData = {
  firstName: "",
  lastName: "",
  middleName: "",
  birthDate: "",
  phone: "",
  email: "",
  discount: "",
};

export default function ClientForm({
  mode,
  clientId,
  initialData,
}: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>(
    initialData || defaultFormData
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        mode === "create" ? "/api/clients" : `/api/clients/${clientId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(
          mode === "create"
            ? "Клиент успешно добавлен!"
            : "Клиент успешно обновлен!"
        );
        router.push("/clients");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert(
        `Ошибка при ${mode === "create" ? "добавлении" : "обновлении"} клиента`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <Link href="/clients" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">
          {mode === "create" ? "Добавить клиента" : "Редактировать клиента"}
        </h1>
        <form onSubmit={handleSubmit}>
          {clientFields.map((field) => (
            <div key={field.name} className="form-group">
              <label className="form-label">
                {field.label} {field.required && "*"}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof ClientFormData]}
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
              {loading
                ? mode === "create"
                  ? "Добавление..."
                  : "Сохранение..."
                : mode === "create"
                ? "Добавить клиента"
                : "Сохранить изменения"}
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
