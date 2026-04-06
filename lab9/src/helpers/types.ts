// Убираем дублирование с types/index.ts, добавляем нужное

export interface ScheduleFormData {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isDayOff?: boolean;
}

// Типы для аналитики
export interface BarberStats {
  id: number;
  name: string;
  workCount: number;
  totalRevenue: number;
}

export interface ServiceStats {
  id: number;
  name: string;
  workCount: number;
  totalRevenue: number;
  category: string | null;
}

export interface ClientStats {
  id: number;
  name: string;
  visitCount: number;
  totalSpent: number;
}

export interface MonthlyStats {
  month: string;
  workCount: number;
  revenue: number;
}

// Параметры фильтрации
export interface FilterParams {
  fio?: string;
  client?: string;
  barber?: string;
  service?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  rating?: string;
  category?: string;
  price?: string;
  popularity?: string;
  discount?: string;
  visits?: string;
  experience?: string;
  specialization?: string;
  schedule?: string;
}

// ========== ТИПЫ ДЛЯ ФОРМ ==========
export interface ClientFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  email: string;
  discount: string;
}

export interface BarberFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  email: string;
  experience: string;
  specialization: string;
  certificates: string;
}

export interface ReviewFormData {
  workId: string;
  rating: string;
  text: string;
}

export interface ServiceFormData {
  name: string;
  duration: string;
  price: string;
  category: string;
}

export interface ServiceFormProps {
  mode: "create" | "update";
  serviceId?: string | null;
  initialData?: ServiceFormData | null;
}

// Типы пропсов для форм
export interface ClientFormProps {
  mode: "create" | "update";
  clientId?: string | null;
  initialData?: ClientFormData | null;
}

export interface BarberFormProps {
  mode: "create" | "update";
  barberId?: string | null;
  initialData?: BarberFormData | null;
}

export interface ReviewFormProps {
  mode: "create" | "update";
  reviewId?: string | null;
  initialData?: ReviewFormData | null;
  presetWorkId?: string | null;
}
