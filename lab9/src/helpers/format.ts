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
