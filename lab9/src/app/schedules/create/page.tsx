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

interface ScheduleFormData {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function CreateSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetBarberId = searchParams.get("barberId");

  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState(
    presetBarberId || ""
  );
  const [schedules, setSchedules] = useState<Record<number, ScheduleFormData>>(
    {}
  );

  useEffect(() => {
    fetch("/api/barbers")
      .then((res) => res.json())
      .then(setBarbers)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedBarberId) {
      fetch(`/api/schedules?barberId=${selectedBarberId}`)
        .then((res) => res.json())
        .then((data: Schedule[]) => {
          const scheduleMap: Record<number, ScheduleFormData> = {};
          data.forEach((s) => {
            scheduleMap[s.dayOfWeek] = {
              id: s.id,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime || "",
              endTime: s.endTime || "",
            };
          });
          setSchedules(scheduleMap);
        })
        .catch(console.error);
    } else {
      setSchedules({});
    }
  }, [selectedBarberId]);

  const updateSchedule = (
    dayValue: number,
    field: keyof ScheduleFormData,
    value: string
  ) => {
    setSchedules((prev) => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        id: prev[dayValue]?.id || 0,
        dayOfWeek: dayValue,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      for (const day of days) {
        const schedule = schedules[day.value];
        if (!schedule) continue;

        const hasData = schedule.startTime || schedule.endTime;
        if (!hasData) continue;

        // Если есть только одно время - ошибка
        if (
          (schedule.startTime && !schedule.endTime) ||
          (!schedule.startTime && schedule.endTime)
        ) {
          alert(`Для ${day.label} укажите и время начала, и время окончания`);
          setLoading(false);
          return;
        }

        const isDayOff = !schedule.startTime && !schedule.endTime;

        if (schedule.id > 0) {
          await fetch(`/api/schedules/${schedule.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startTime: schedule.startTime || null,
              endTime: schedule.endTime || null,
              isDayOff: isDayOff,
            }),
          });
        } else if (schedule.startTime && schedule.endTime) {
          await fetch("/api/schedules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              barberId: parseInt(selectedBarberId),
              dayOfWeek: day.value,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              isDayOff: false,
            }),
          });
        }
      }

      alert("Расписание сохранено!");
      router.push("/barbers");
    } catch {
      alert("Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  const selectedBarber = barbers.find(
    (b) => b.id === parseInt(selectedBarberId)
  );

  return (
    <div className="form-container schedule-form-container">
      <div className="form-card">
        <Link href="/barbers" className="btn-back">
          ← Назад к парикмахерам
        </Link>

        <h1 className="form-title">Редактирование расписания</h1>

        {selectedBarber && (
          <>
            <div className="schedule-info">
              <strong>Парикмахер:</strong> {selectedBarber.person.lastName}{" "}
              {selectedBarber.person.firstName}
            </div>

            <div className="schedule-table-wrapper">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>День недели</th>
                    <th>Время начала</th>
                    <th>Время окончания</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => {
                    const schedule = schedules[day.value];
                    const startTime = schedule?.startTime || "";
                    const endTime = schedule?.endTime || "";
                    const isDayOff = !startTime && !endTime;

                    return (
                      <tr key={day.value}>
                        <td className="schedule-day">{day.label}</td>
                        <td>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) =>
                              updateSchedule(
                                day.value,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="form-input schedule-time-input"
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) =>
                              updateSchedule(
                                day.value,
                                "endTime",
                                e.target.value
                              )
                            }
                            className="form-input schedule-time-input"
                          />
                        </td>
                        <td className="schedule-status">
                          {isDayOff ? (
                            <span className="badge badge-warning">
                              Выходной
                            </span>
                          ) : startTime && endTime ? (
                            <span className="badge badge-success">Рабочий</span>
                          ) : (
                            <span className="badge badge-info">
                              Не заполнено
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="button-group">
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-submit"
              >
                {loading ? "Сохранение..." : "Сохранить всё"}
              </button>
              <button
                onClick={() => router.push("/barbers")}
                className="btn-cancel"
              >
                Отмена
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
