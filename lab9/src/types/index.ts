// src/types/index.ts

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface Barber {
  id: number;
  experience: number | null;
  specialization: string | null;
  certificates: string | null; // 👈 добавляем
  person: Person;
  _count?: { works: number };
}

export interface Client {
  id: number;
  discount: number | null;
  firstVisit: string | null;
  person: Person;
  _count?: { works: number };
}

export interface Service {
  id: number;
  name: string;
  duration: number | null;
  price: number;
  category: string | null;
  _count?: { works: number };
}

export interface Work {
  id: number;
  workDate: string;
  barber: {
    person: Person;
  };
  client: {
    person: Person;
  };
  service: Service;
  review: Review | null; // 👈 добавляем review
}

export interface Stats {
  barbersCount: number;
  clientsCount: number;
  servicesCount: number;
  worksCount: number;
  recentWorks: Work[];
}

export interface Schedule {
  id: number;
  barberId: number;
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
  isDayOff: boolean;
}

export interface Review {
  id: number;
  rating: number;
  text: string | null;
  reviewDate: string;
  work: {
    id: number;
    workDate: string;
    client: { person: Person };
    barber: { person: Person };
    service: Service;
  };
}
