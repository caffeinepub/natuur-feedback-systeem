import { useCallback, useEffect, useState } from "react";
import { useActor } from "./useActor";

const SESSION_KEY = "admin_session_token";

export function useAdminSession() {
  const { actor, isFetching } = useActor();
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY),
  );

  const setToken = useCallback((t: string | null) => {
    if (t) {
      localStorage.setItem(SESSION_KEY, t);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    setTokenState(t);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setTokenState(null);
  }, []);

  // On mount, validate the stored token
  useEffect(() => {
    if (!actor || isFetching || !token) return;
    actor.isSessionValid(token).then((valid) => {
      if (!valid) {
        clearToken();
      }
    });
  }, [actor, isFetching, token, clearToken]);

  return { token, setToken, clearToken };
}
