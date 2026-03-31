"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Barber, Schedule } from "@/types";
import "../../forms.css";

const days = [
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
  { value: 7, label: "Воскресенье" },
];

interface FormData {
  barberId: string;
  startTime: string;
  endTime: string;
  isDayOff: boolean;
  dayOfWeek?: string; // для режима single
}

export default function CreateSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetBarberId = searchParams.get("barberId");

  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [existingDays, setExistingDays] = useState<number[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [mode, setMode] = useState<"single" | "multiple">("single");
  const [formData, setFormData] = useState<FormData>({
    barberId: presetBarberId || "",
    startTime: "",
    endTime: "",
    isDayOff: false,
    dayOfWeek: "",
  });

  // Загрузка парикмахеров
  useEffect(() => {
    fetch("/api/barbers")
      .then((res) => res.json())
      .then((data: Barber[]) => setBarbers(data))
      .catch((err) => console.error(err));
  }, []);

  // Загрузка существующего расписания выбранного парикмахера
  useEffect(() => {
    if (formData.barberId) {
      fetch(`/api/schedules?barberId=${formData.barberId}`)
        .then((res) => res.json())
        .then((data: Schedule[]) => {
          const daysList = data.map((s: Schedule) => s.dayOfWeek);
          setExistingDays(daysList);
        })
        .catch((err) => console.error(err));

      const barber = barbers.find((b) => b.id === parseInt(formData.barberId));
      setSelectedBarber(barber || null);
    } else {
      setExistingDays([]);
      setSelectedBarber(null);
      setSelectedDays([]);
    }
  }, [formData.barberId, barbers]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let daysToAdd: number[] = [];

    if (mode === "single") {
      if (formData.dayOfWeek) {
        daysToAdd = [parseInt(formData.dayOfWeek)];
      }
    } else {
      daysToAdd = selectedDays;
    }

    if (daysToAdd.length === 0) {
      alert("Выберите хотя бы один день");
      setLoading(false);
      return;
    }

    try {
      const promises = daysToAdd.map((day) =>
        fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barberId: formData.barberId,
            dayOfWeek: day,
            startTime: formData.startTime,
            endTime: formData.endTime,
            isDayOff: formData.isDayOff,
          }),
        })
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every((res) => res.ok);

      if (allSuccess) {
        alert(`Успешно добавлено ${daysToAdd.length} дней!`);
        router.push("/barbers");
      } else {
        alert("Ошибка при добавлении некоторых дней");
      }
    } catch {
      alert("Ошибка при добавлении расписания");
    } finally {
      setLoading(false);
    }
  };

  const isDayExists = (dayValue: number) => existingDays.includes(dayValue);
  const isDaySelected = (dayValue: number) => selectedDays.includes(dayValue);

  return (
    <div className="form-container">
      <div className="form-card">
        <Link href="/barbers" className="btn-back">
          ← Назад к парикмахерам
        </Link>
        <h1 className="form-title">Добавить расписание</h1>

        {selectedBarber && (
          <div
            style={{
              background: "#f3f4f6",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            Парикмахер:{" "}
            <strong>
              {selectedBarber.person.lastName} {selectedBarber.person.firstName}
            </strong>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Парикмахер *</label>
            <select
              name="barberId"
              value={formData.barberId}
              onChange={handleChange}
              required
              className="form-input"
              disabled={!!presetBarberId}
            >
              <option value="">Выберите парикмахера</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.person.lastName} {b.person.firstName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Режим добавления</label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="radio"
                  value="single"
                  checked={mode === "single"}
                  onChange={() => setMode("single")}
                />
                Один день
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="radio"
                  value="multiple"
                  checked={mode === "multiple"}
                  onChange={() => setMode("multiple")}
                />
                Несколько дней
              </label>
            </div>
          </div>

          {mode === "single" ? (
            <div className="form-group">
              <label className="form-label">День недели *</label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Выберите день</option>
                {days.map((d) => (
                  <option
                    key={d.value}
                    value={d.value}
                    disabled={isDayExists(d.value)}
                    style={
                      isDayExists(d.value)
                        ? { color: "#dc2626", background: "#fee2e2" }
                        : {}
                    }
                  >
                    {d.label} {isDayExists(d.value) ? "⚠️ (уже есть)" : ""}
                  </option>
                ))}
              </select>
              {formData.dayOfWeek &&
                isDayExists(parseInt(formData.dayOfWeek)) && (
                  <p
                    style={{
                      color: "#dc2626",
                      fontSize: "0.75rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    ⚠️ Внимание! У этого парикмахера уже есть расписание на этот
                    день
                  </p>
                )}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Выберите дни *</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "0.5rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                }}
              >
                {days.map((d) => {
                  const exists = isDayExists(d.value);
                  const selected = isDaySelected(d.value);
                  return (
                    <label
                      key={d.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem",
                        borderRadius: "0.375rem",
                        background: selected
                          ? "#dbeafe"
                          : exists
                          ? "#fee2e2"
                          : "#f9fafb",
                        cursor: exists ? "not-allowed" : "pointer",
                        opacity: exists ? 0.6 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleDay(d.value)}
                        disabled={exists}
                      />
                      <span style={{ color: exists ? "#dc2626" : "#374151" }}>
                        {d.label} {exists && "⚠️"}
                      </span>
                    </label>
                  );
                })}
              </div>
              {selectedDays.length > 0 && (
                <p
                  style={{
                    color: "#2563eb",
                    fontSize: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  Выбрано дней: {selectedDays.length}
                </p>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                name="isDayOff"
                checked={formData.isDayOff}
                onChange={handleChange}
                style={{ marginRight: "0.5rem" }}
              />
              Выходной день
            </label>
          </div>

          {!formData.isDayOff && (
            <>
              <div className="form-group">
                <label className="form-label">Время начала</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Время окончания</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </>
          )}

          {existingDays.length > 0 && (
            <div
              style={{
                background: "#fef3c7",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.75rem",
              }}
            >
              <strong>📅 Уже добавлены дни:</strong>{" "}
              {existingDays
                .sort((a, b) => a - b)
                .map((d) => days.find((day) => day.value === d)?.label)
                .join(", ")}
            </div>
          )}

          <div className="button-group">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? "Добавление..."
                : mode === "multiple" && selectedDays.length > 0
                ? `Добавить ${selectedDays.length} дней`
                : "Добавить день"}
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
