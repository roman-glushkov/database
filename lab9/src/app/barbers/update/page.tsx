"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BarberForm from "@/components/BarberForm";
import "../../forms.css";

interface ApiResponse {
  person?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    birthDate?: string;
    phone?: string;
    email?: string;
  };
  experience?: number;
  specialization?: string;
  certificates?: string;
}

export default function UpdateBarberPage() {
  const searchParams = useSearchParams();
  const barberId = searchParams.get("id");
  const [initialData, setInitialData] = useState<{
    firstName: string;
    lastName: string;
    middleName: string;
    birthDate: string;
    phone: string;
    email: string;
    experience: string;
    specialization: string;
    certificates: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/barbers/${barberId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then((data: ApiResponse) => {
        setInitialData({
          firstName: data?.person?.firstName ?? "",
          lastName: data?.person?.lastName ?? "",
          middleName: data?.person?.middleName ?? "",
          birthDate: data?.person?.birthDate?.split("T")[0] ?? "",
          phone: data?.person?.phone ?? "",
          email: data?.person?.email ?? "",
          experience: data?.experience?.toString() ?? "",
          specialization: data?.specialization ?? "",
          certificates: data?.certificates ?? "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Парикмахер не найден");
        setLoading(false);
      });
  }, [barberId]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="loading">{error}</div>;
  if (!initialData) return <div className="loading">Парикмахер не выбран</div>;

  return (
    <BarberForm mode="update" barberId={barberId} initialData={initialData} />
  );
}
