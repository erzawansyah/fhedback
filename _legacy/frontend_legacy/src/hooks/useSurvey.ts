import { useState, useEffect } from "react";
import { getSurveys } from "@/utils/getSurveys";
import { QuestionnaireMetadata } from "@/lib/interfaces/questionnaire";

interface UseSurveyResult {
  surveys: QuestionnaireMetadata[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSurvey(
  count: number = 10,
  offset: number = 0
): UseSurveyResult {
  const [surveys, setSurveys] = useState<QuestionnaireMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = () => {
    setLoading(true);
    setError(null);
    try {
      const data = getSurveys(count, offset);
      setSurveys(data);
    } catch {
      setError("Gagal mengambil data survei");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, offset]);

  return {
    surveys,
    loading,
    error,
    refresh: fetchSurveys,
  };
}
