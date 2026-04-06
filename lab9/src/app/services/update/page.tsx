"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ServiceForm from "@/components/ServiceForm";
import { ServiceFormData } from "@/helpers/types";
import "../../forms.css";

export default function UpdateServicePage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id");
  const [initialData, setInitialData] = useState<ServiceFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/services/${serviceId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then((data) => {
        setInitialData({
          name: data?.name || "",
          duration: data?.duration?.toString() || "",
          price: data?.price?.toString() || "",
          category: data?.category || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Услуга не найдена");
        setLoading(false);
      });
  }, [serviceId]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="loading">{error}</div>;
  if (!initialData) return <div className="loading">Услуга не выбрана</div>;

  return (
    <ServiceForm
      mode="update"
      serviceId={serviceId}
      initialData={initialData}
    />
  );
}
