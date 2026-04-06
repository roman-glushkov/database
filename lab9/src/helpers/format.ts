export const formatMoney = (value: number): string =>
  `${value.toLocaleString()} ₽`;

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU");
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString("ru-RU");
};

export const avgPrice = (total: number, count: number): string =>
  count > 0 ? `${Math.round(total / count).toLocaleString()} ₽` : "0 ₽";

export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return "-";
  return phone;
};

export const getFullName = (person: {
  firstName: string;
  lastName: string;
  middleName?: string | null;
}) =>
  `${person.lastName} ${person.firstName}${
    person.middleName ? ` ${person.middleName}` : ""
  }`;

// Рендер звезд рейтинга
export const renderStars = (rating: number, maxStars: number = 5): string => {
  return "★".repeat(rating) + "☆".repeat(maxStars - rating);
};

// Получить текст рейтинга
export const getRatingText = (rating: number): string => {
  const texts: Record<number, string> = {
    5: "Отлично",
    4: "Хорошо",
    3: "Средне",
    2: "Плохо",
    1: "Ужасно",
  };
  return texts[rating] || "";
};

// Получить статус дня расписания
export const getScheduleStatus = (startTime: string, endTime: string) => {
  if (!startTime && !endTime) return { text: "Выходной", type: "warning" };
  if (startTime && endTime) return { text: "Рабочий", type: "success" };
  return { text: "Не заполнено", type: "info" };
};
