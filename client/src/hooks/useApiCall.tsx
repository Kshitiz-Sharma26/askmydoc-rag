import { useState, useCallback } from "react";

type ApiResponse<TData = unknown> = {
  status: number;
  message: string;
  data?: TData;
};

function useApiCall<TPayload, TData = unknown>(
  apiService: (payload: TPayload) => Promise<ApiResponse<TData>>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<TData | null>(null);

  const fetchData = useCallback(
    async (
      payload: TPayload,
    ): Promise<{ data: TData | null; error: string | null }> => {
      try {
        setLoading(true);
        setError("");
        setData(null);

        const response = await apiService(payload);

        let responseData: TData | null = null;
        if (response.data !== undefined) {
          responseData = response.data;
          setData(responseData);
        }

        return { data: responseData, error: null };
      } catch (err: unknown) {
        let errMessage = "An unexpected error occurred";
        if (err instanceof Error) {
          errMessage = err.message;
        }
        setError(errMessage);
        return { data: null, error: errMessage };
      } finally {
        setLoading(false);
      }
    },
    [apiService],
  );

  return {
    fetchData,
    loading,
    error,
    data,
  };
}

export default useApiCall;
