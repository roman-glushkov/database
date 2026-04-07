"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Barber, Schedule } from "@/types";
import { daysOfWeek } from "@/helpers/constants";
import { getFullName, getScheduleStatus } from "@/helpers/format";
import "../../forms.css";
import { ScheduleFormData } from "@/helpers/types";

export default function CreateSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetBarberId = searchParams.get("barberId");

  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId] = useState(presetBarberId || "");
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
    if (!selectedBarberId) {
      setSchedules({});
      return;
    }

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
      for (const day of daysOfWeek) {
        const schedule = schedules[day.value];
        if (!schedule) continue;

        const hasData = schedule.startTime || schedule.endTime;
        if (!hasData) continue;

        if (
          (schedule.startTime && !schedule.endTime) ||
          (!schedule.startTime && schedule.endTime)
        ) {
          alert(`Для ${day.label} укажите и время начала, и время окончания`);
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
              isDayOff,
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

  if (!selectedBarber) {
    return (
      <div className="form-container">
        <div className="form-card">
          <Link href="/barbers" className="btn-back">
            ← Назад к парикмахерам
          </Link>
          <div className="loading">Выберите парикмахера</div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container schedule-form-container">
      <div className="form-card">
        <Link href="/barbers" className="btn-back">
          ← Назад к парикмахерам
        </Link>
        <h1 className="form-title">Редактирование расписания</h1>

        <div className="schedule-info">
          <strong>Парикмахер:</strong> {getFullName(selectedBarber.person)}
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
              {daysOfWeek.map((day) => {
                const schedule = schedules[day.value];
                const startTime = schedule?.startTime || "";
                const endTime = schedule?.endTime || "";
                const status = getScheduleStatus(startTime, endTime);

                return (
                  <tr key={day.value}>
                    <td className="schedule-day">{day.label}</td>
                    <td>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) =>
                          updateSchedule(day.value, "startTime", e.target.value)
                        }
                        className="form-input schedule-time-input"
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) =>
                          updateSchedule(day.value, "endTime", e.target.value)
                        }
                        className="form-input schedule-time-input"
                      />
                    </td>
                    <td className="schedule-status">
                      <span className={`badge badge-${status.type}`}>
                        {status.text}
                      </span>
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
      </div>
    </div>
  );
}
