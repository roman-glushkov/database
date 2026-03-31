"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Work } from "@/types";
import "../../forms.css";

export default function CreateReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetWorkId = searchParams.get("workId");

  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [formData, setFormData] = useState({
    workId: presetWorkId || "",
    rating: "5",
    text: "",
  });

  useEffect(() => {
    fetch("/api/works")
      .then((res) => res.json())
      .then((data) => {
        // Показываем только работы без отзывов
        const withoutReview = data.filter((w: Work) => !w.review);
        setWorks(withoutReview);

        if (presetWorkId) {
          const work = withoutReview.find(
            (w: Work) => w.id === parseInt(presetWorkId)
          );
          setSelectedWork(work || null);
        }
      })
      .catch((err) => console.error(err));
  }, [presetWorkId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Если выбран другой workId, обновляем selectedWork
    if (e.target.name === "workId" && e.target.value) {
      const work = works.find((w) => w.id === parseInt(e.target.value));
      setSelectedWork(work || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Отзыв успешно добавлен!");
        router.push("/reviews");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert("Ошибка при добавлении отзыва");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <Link href="/reviews" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">Добавить отзыв</h1>

        {selectedWork && (
          <div
            style={{
              background: "#f3f4f6",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            <div>
              <strong>Клиент:</strong> {selectedWork.client.person.lastName}{" "}
              {selectedWork.client.person.firstName}
            </div>
            <div>
              <strong>Парикмахер:</strong> {selectedWork.barber.person.lastName}{" "}
              {selectedWork.barber.person.firstName}
            </div>
            <div>
              <strong>Услуга:</strong> {selectedWork.service.name} (
              {selectedWork.service.price} ₽)
            </div>
            <div>
              <strong>Дата:</strong>{" "}
              {new Date(selectedWork.workDate).toLocaleDateString("ru-RU")}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Работа *</label>
            <select
              name="workId"
              value={formData.workId}
              onChange={handleChange}
              required
              className="form-input"
              disabled={!!presetWorkId}
            >
              <option value="">Выберите выполненную работу</option>
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.client.person.lastName} {w.client.person.firstName} -{" "}
                  {w.service.name} (
                  {new Date(w.workDate).toLocaleDateString("ru-RU")})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Оценка *</label>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <label
                  key={star}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={star}
                    checked={parseInt(formData.rating) === star}
                    onChange={handleChange}
                  />
                  <span
                    style={{
                      fontSize: "1.25rem",
                      color:
                        star <= parseInt(formData.rating)
                          ? "#f59e0b"
                          : "#d1d5db",
                    }}
                  >
                    {"★"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Отзыв</label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Расскажите о своем опыте..."
              rows={5}
            />
          </div>

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Добавление..." : "Добавить отзыв"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/reviews")}
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
