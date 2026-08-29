import { goToLogin } from "@/const";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import type { Session } from "@supabase/supabase-js";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();

  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setSessionLoading(false);
      utils.auth.me.invalidate();
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [utils]);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(session),
  });

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [utils]);

  const state = useMemo(
    () => ({
      session,
      user: session ? (meQuery.data ?? null) : null,
      loading: sessionLoading || (Boolean(session) && meQuery.isLoading),
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(session),
    }),
    [session, sessionLoading, meQuery.data, meQuery.error, meQuery.isLoading]
  );

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.session) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    if (redirectPath) {
      window.location.assign(redirectPath);
    } else {
      goToLogin();
    }
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.session]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
