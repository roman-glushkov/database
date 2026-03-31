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
  person: Person;
  _count?: { works: number };
}

export interface Client {
  id: number;
  discount: number | null;
  firstVisit: string | null;
  person: Person;
}

export interface Service {
  id: number;
  name: string;
  duration: number | null;
  price: number;
  category: string | null;
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
}

export interface Stats {
  barbersCount: number;
  clientsCount: number;
  servicesCount: number;
  worksCount: number;
  recentWorks: Work[];
}
