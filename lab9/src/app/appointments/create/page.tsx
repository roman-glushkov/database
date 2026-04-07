"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Barber, Client, Service, Schedule } from "@/types";
import { getFullName, formatDate } from "@/helpers/format";
import { categories, categorySpecializations } from "@/helpers/constants";
import { generateTimeSlots, ExistingAppointment } from "@/helpers/timeSlots";
import "../../forms.css";

export default function CreateAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Данные из БД
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Выбранные значения
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Производные состояния
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [availableBarbers, setAvailableBarbers] = useState<Barber[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [barberWorkTime, setBarberWorkTime] = useState<{
    start: string;
    end: string;
  } | null>(null);

  const selectedClientData = clients.find(
    (c) => c.id === parseInt(selectedClient)
  );

  // Загрузка данных
  useEffect(() => {
    Promise.all([
      fetch("/api/barbers").then((res) => res.json()),
      fetch("/api/clients").then((res) => res.json()),
      fetch("/api/services").then((res) => res.json()),
      fetch("/api/schedules").then((res) => res.json()),
    ])
      .then(([barbersData, clientsData, servicesData, schedulesData]) => {
        setBarbers(barbersData);
        setClients(clientsData);
        setServices(servicesData);
        setSchedules(schedulesData);
      })
      .catch(console.error);
  }, []);

  // Фильтр услуг по категории
  useEffect(() => {
    if (selectedCategory) {
      setAvailableServices(
        services.filter((s) => s.category === selectedCategory)
      );
    } else {
      setAvailableServices([]);
    }
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimeSlots([]);
  }, [selectedCategory, services]);

  // Фильтр парикмахеров по специализации услуги
  useEffect(() => {
    if (selectedService?.category) {
      const specializations = categorySpecializations[selectedService.category];
      if (specializations) {
        setAvailableBarbers(
          barbers.filter(
            (b) =>
              b.specialization && specializations.includes(b.specialization)
          )
        );
      } else {
        setAvailableBarbers([]);
      }
    } else {
      setAvailableBarbers([]);
    }
    setSelectedBarber(null);
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimeSlots([]);
  }, [selectedService, barbers]);

  // Генерация временных слотов
  useEffect(() => {
    if (!selectedBarber || !selectedDate || !selectedService) {
      setAvailableTimeSlots([]);
      return;
    }

    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    const schedule = schedules.find(
      (s) => s.barberId === selectedBarber.id && s.dayOfWeek === dayOfWeek
    );

    if (!schedule || schedule.isDayOff) {
      setBarberWorkTime(null);
      setAvailableTimeSlots([]);
      return;
    }

    const startTime = schedule.startTime || "09:00";
    const endTime = schedule.endTime || "18:00";
    setBarberWorkTime({ start: startTime, end: endTime });

    fetch(
      `/api/appointments?barberId=${selectedBarber.id}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((existing: ExistingAppointment[]) => {
        const slots = generateTimeSlots(
          startTime,
          endTime,
          selectedService.duration || 60,
          existing
        );
        setAvailableTimeSlots(slots);
      })
      .catch(console.error);
  }, [selectedBarber, selectedDate, selectedService, schedules]);

  const resetToStep = (newStep: number) => {
    setStep(newStep);
    if (newStep === 1) {
      setSelectedCategory("");
      setSelectedService(null);
      setSelectedBarber(null);
      setSelectedDate("");
      setSelectedTime("");
    } else if (newStep === 2) {
      setSelectedService(null);
      setSelectedBarber(null);
      setSelectedDate("");
      setSelectedTime("");
    } else if (newStep === 3) {
      setSelectedBarber(null);
      setSelectedDate("");
      setSelectedTime("");
    } else if (newStep === 4) {
      setSelectedDate("");
      setSelectedTime("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedClient ||
      !selectedService ||
      !selectedBarber ||
      !selectedDate ||
      !selectedTime
    ) {
      alert("Заполните все поля");
      return;
    }

    setLoading(true);
    try {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          barberId: selectedBarber.id,
          serviceId: selectedService.id,
          date: dateTime.toISOString(),
        }),
      });

      if (res.ok) {
        alert("Запись успешно создана!");
        router.push("/appointments");
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch {
      alert("Ошибка при создании записи");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <Link href="/appointments" className="btn-back">
          ← Назад к списку
        </Link>
        <h1 className="form-title">Новая запись</h1>

        {/* Индикатор шагов */}
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span className="step-num">1</span>
            <span className="step-label">Клиент</span>
          </div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span className="step-num">2</span>
            <span className="step-label">Услуга</span>
          </div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span className="step-num">3</span>
            <span className="step-label">Парикмахер</span>
          </div>
          <div className={`step ${step >= 4 ? "active" : ""}`}>
            <span className="step-num">4</span>
            <span className="step-label">Дата и время</span>
          </div>
          <div className={`step ${step >= 5 ? "active" : ""}`}>
            <span className="step-num">5</span>
            <span className="step-label">Подтверждение</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Шаг 1: Выбор клиента */}
          {step === 1 && (
            <div className="step-content">
              <div className="form-group">
                <label className="form-label">Выберите клиента *</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">Выберите клиента</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getFullName(c.person)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn-next"
                onClick={() => selectedClient && resetToStep(2)}
                disabled={!selectedClient}
              >
                Далее →
              </button>
            </div>
          )}

          {/* Шаг 2: Выбор категории и услуги */}
          {step === 2 && (
            <div className="step-content">
              <div className="form-group">
                <label className="form-label">Категория услуги *</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory && (
                <div className="form-group">
                  <label className="form-label">Услуга *</label>
                  <select
                    value={selectedService?.id || ""}
                    onChange={(e) => {
                      const service = availableServices.find(
                        (s) => s.id === parseInt(e.target.value)
                      );
                      setSelectedService(service || null);
                    }}
                    required
                    className="form-input"
                  >
                    <option value="">Выберите услугу</option>
                    {availableServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - {s.price} ₽ ({s.duration} мин)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="button-group">
                <button
                  type="button"
                  className="btn-back-step"
                  onClick={() => resetToStep(1)}
                >
                  ← Назад
                </button>
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => selectedService && resetToStep(3)}
                  disabled={!selectedService}
                >
                  Далее →
                </button>
              </div>
            </div>
          )}

          {/* Шаг 3: Выбор парикмахера */}
          {step === 3 && (
            <div className="step-content">
              <div className="info-box">
                <strong>Выбранная услуга:</strong> {selectedService?.name} (
                {selectedService?.duration} мин)
              </div>

              <div className="form-group">
                <label className="form-label">Парикмахер *</label>
                <select
                  value={selectedBarber?.id || ""}
                  onChange={(e) => {
                    const barber = availableBarbers.find(
                      (b) => b.id === parseInt(e.target.value)
                    );
                    setSelectedBarber(barber || null);
                  }}
                  required
                  className="form-input"
                >
                  <option value="">Выберите парикмахера</option>
                  {availableBarbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {getFullName(b.person)} ({b.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  className="btn-back-step"
                  onClick={() => resetToStep(2)}
                >
                  ← Назад
                </button>
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => selectedBarber && resetToStep(4)}
                  disabled={!selectedBarber}
                >
                  Далее →
                </button>
              </div>
            </div>
          )}

          {/* Шаг 4: Выбор даты и времени */}
          {step === 4 && (
            <div className="step-content">
              <div className="info-box">
                <strong>Услуга:</strong> {selectedService?.name} (
                {selectedService?.duration} мин)
                <br />
                <strong>Парикмахер:</strong>{" "}
                {selectedBarber && getFullName(selectedBarber.person)}
              </div>

              <div className="form-group">
                <label className="form-label">Дата *</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="form-input"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {selectedDate && barberWorkTime && (
                <>
                  <div className="info-box">
                    <strong>Рабочие часы:</strong> {barberWorkTime.start} -{" "}
                    {barberWorkTime.end}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Время *</label>
                    <div className="time-slots">
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className={`time-slot ${
                              selectedTime === slot ? "selected" : ""
                            }`}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </button>
                        ))
                      ) : (
                        <p className="text-center">
                          Нет свободного времени на эту дату
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {selectedDate && !barberWorkTime && (
                <div className="error-box">
                  Парикмахер не работает в выбранный день
                </div>
              )}

              <div className="button-group">
                <button
                  type="button"
                  className="btn-back-step"
                  onClick={() => resetToStep(3)}
                >
                  ← Назад
                </button>
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => selectedTime && resetToStep(5)}
                  disabled={!selectedTime}
                >
                  Далее →
                </button>
              </div>
            </div>
          )}

          {/* Шаг 5: Подтверждение */}
          {step === 5 && (
            <div className="step-content">
              <div className="confirm-box">
                <h3>Подтверждение записи</h3>
                <p>
                  <strong>Клиент:</strong>{" "}
                  {selectedClientData && getFullName(selectedClientData.person)}
                </p>
                <p>
                  <strong>Услуга:</strong> {selectedService?.name}
                </p>
                <p>
                  <strong>Длительность:</strong> {selectedService?.duration} мин
                </p>
                <p>
                  <strong>Цена:</strong> {selectedService?.price} ₽
                </p>
                <p>
                  <strong>Парикмахер:</strong>{" "}
                  {selectedBarber && getFullName(selectedBarber.person)}
                </p>
                <p>
                  <strong>Дата:</strong> {formatDate(selectedDate)}
                </p>
                <p>
                  <strong>Время:</strong> {selectedTime}
                </p>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  className="btn-back-step"
                  onClick={() => resetToStep(4)}
                >
                  ← Назад
                </button>
                <button type="submit" disabled={loading} className="btn-submit">
                  {loading ? "Создание..." : "Подтвердить запись"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
