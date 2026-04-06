"use client";

import { useSearchParams } from "next/navigation";
import ReviewForm from "@/components/ReviewForm";

export default function CreateReviewPage() {
  const searchParams = useSearchParams();
  const presetWorkId = searchParams.get("workId");

  return <ReviewForm mode="create" presetWorkId={presetWorkId} />;
}
