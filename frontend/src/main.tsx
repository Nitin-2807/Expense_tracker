import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, useAuth } from "@clerk/react";
import { useThemeStore } from "./stores/theme-store";
import { setClerkTokenProvider } from "./lib/api";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function HydrateTheme({ children }: { children: React.ReactNode }) {
  const hydrate = useThemeStore((s) => s._hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return <>{children}</>;
}

/** Injects the Clerk session token into every API request. */
function AuthBridge({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  useEffect(() => {
    setClerkTokenProvider(() => getToken());
  }, [getToken]);
  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ClerkProvider
          publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
          afterSignOutUrl="/login"
          signInUrl="/login"
          signUpUrl="/signup"
        >
          <AuthBridge>
            <HydrateTheme>
              <App />
            </HydrateTheme>
          </AuthBridge>
        </ClerkProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
