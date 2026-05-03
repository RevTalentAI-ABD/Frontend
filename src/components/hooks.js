import { useState, useEffect, useCallback } from "react";

export function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchFn();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

export function useToast() {
  const [toast, setToast] = useState("");
  const showToast = (msg, duration = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(""), duration);
  };
  return { toast, showToast };
}
