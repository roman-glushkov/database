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
