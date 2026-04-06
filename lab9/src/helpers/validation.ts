import { z } from "zod";

// Валидация Person
export const PersonSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  middleName: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email("Неверный email").nullable().optional(),
});

// Валидация Barber
export const BarberSchema = PersonSchema.extend({
  experience: z.number().min(0).nullable().optional(),
  specialization: z.string().nullable().optional(),
  certificates: z.string().nullable().optional(),
});

// Валидация Client
export const ClientSchema = PersonSchema.extend({
  discount: z.number().min(0).max(100).nullable().optional(),
});

// Валидация Service
export const ServiceSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  duration: z.number().positive().nullable().optional(),
  price: z.number().positive("Цена должна быть положительной"),
  category: z.string().nullable().optional(),
});

// Валидация Appointment
export const AppointmentSchema = z.object({
  clientId: z.number().positive(),
  barberId: z.number().positive(),
  serviceId: z.number().positive(),
  date: z.string().datetime(),
});

// Валидация Review
export const ReviewSchema = z.object({
  workId: z.number().positive(),
  rating: z.number().min(1).max(5),
  text: z.string().max(1000).nullable().optional(),
});

// Валидация Schedule
export const ScheduleSchema = z.object({
  barberId: z.number().positive(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .nullable(),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .nullable(),
  isDayOff: z.boolean().default(false),
});
