"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ClientForm from "@/components/ClientForm";
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
  discount?: number;
}

export default function UpdateClientPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("id");
  const [initialData, setInitialData] = useState<{
    firstName: string;
    lastName: string;
    middleName: string;
    birthDate: string;
    phone: string;
    email: string;
    discount: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
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
          discount: data?.discount?.toString() ?? "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Клиент не найден");
        setLoading(false);
      });
  }, [clientId]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="loading">{error}</div>;
  if (!initialData) return <div className="loading">Клиент не выбран</div>;

  return (
    <ClientForm mode="update" clientId={clientId} initialData={initialData} />
  );
}
