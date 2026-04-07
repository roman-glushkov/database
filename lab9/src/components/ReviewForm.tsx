"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Work } from "@/types";
import { formatDate, getFullName } from "@/helpers/format";
import { ReviewFormData, ReviewFormProps } from "@/helpers/types";
import "../app/forms.css";

const defaultFormData: ReviewFormData = {
  workId: "",
  rating: "5",
  text: "",
};

export default function ReviewForm({
  mode,
  reviewId,
  initialData,
  presetWorkId,
}: ReviewFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>(
    initialData || defaultFormData
  );

  // Загрузка работ для создания отзыва
  useEffect(() => {
    if (mode === "create") {
      fetch("/api/works")
        .then((res) => res.json())
        .then((data) => {
          const withoutReview = data.filter((w: Work) => !w.review);
          setWorks(withoutReview);
          if (presetWorkId) {
            const work = withoutReview.find(
              (w: Work) => w.id === parseInt(presetWorkId)
            );
            setSelectedWork(work || null);
            if (work)
              setFormData((prev) => ({ ...prev, workId: presetWorkId }));
          }
        })
        .catch((err) => console.error(err));
    } else if (mode === "update" && reviewId && initialData?.workId) {
      // Загрузка информации о работе для режима update
      fetch(`/api/works/${initialData.workId}`)
        .then((res) => res.json())
        .then((work: Work) => setSelectedWork(work))
        .catch((err) => console.error(err));
    }
  }, [mode, presetWorkId, reviewId, initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "workId" && value) {
      const work = works.find((w) => w.id === parseInt(value));
      setSelectedWork(work || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        mode === "create" ? "/api/reviews" : `/api/reviews/${reviewId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId: parseInt(formData.workId),
          rating: parseInt(formData.rating),
          text: formData.text,
        }),
      });

      if (res.ok) {
        alert(
          mode === "create"
            ? "Отзыв успешно добавлен!"
            : "Отзыв успешно обновлен!"
        );
        router.push("/reviews");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert(
        `Ошибка при ${mode === "create" ? "добавлении" : "обновлении"} отзыва`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderWorkInfo = (work: Work) => (
    <div
      className="work-info"
      style={{
        background: "#f3f4f6",
        padding: "0.75rem",
        borderRadius: "0.5rem",
        marginBottom: "1rem",
        textAlign: "center",
      }}
    >
      <div>
        <strong>Клиент:</strong> {getFullName(work.client.person)}
      </div>
      <div>
        <strong>Парикмахер:</strong> {getFullName(work.barber.person)}
      </div>
      <div>
        <strong>Услуга:</strong> {work.service.name} ({work.service.price} ₽)
      </div>
      <div>
        <strong>Дата работы:</strong> {formatDate(work.workDate)}
      </div>
    </div>
  );

  const renderRatingStars = () => (
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
              color: star <= parseInt(formData.rating) ? "#f59e0b" : "#d1d5db",
            }}
          >
            ★
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="form-container">
      <div className="form-card">
        <Link href="/reviews" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">
          {mode === "create" ? "Добавить отзыв" : "Редактировать отзыв"}
        </h1>

        {selectedWork && renderWorkInfo(selectedWork)}

        <form onSubmit={handleSubmit}>
          {mode === "create" && (
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
                    {getFullName(w.client.person)} - {w.service.name} (
                    {formatDate(w.workDate)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Оценка *</label>
            {renderRatingStars()}
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
              {loading
                ? mode === "create"
                  ? "Добавление..."
                  : "Сохранение..."
                : mode === "create"
                ? "Добавить отзыв"
                : "Сохранить изменения"}
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
