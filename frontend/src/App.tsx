import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth, SignIn, SignUp } from "@clerk/react";
import { Layout } from "./layouts/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";

// ── Clerk key check ────────────────────────────────────────────────
const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
const CLERK_MISCONFIGURED = CLERK_KEY.startsWith("pk_placeholder") || CLERK_KEY === "";

function ClerkMissingBanner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--background))] p-4">
      <div className="w-full max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-950">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
          <svg className="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-amber-800 dark:text-amber-200">
          Clerk not configured
        </h2>
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
          The <code className="rounded bg-amber-100/50 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/50">VITE_CLERK_PUBLISHABLE_KEY</code> environment variable is missing or set to the placeholder value.
        </p>
        <ol className="mx-auto mb-4 max-w-sm space-y-2 text-left text-sm text-amber-700 dark:text-amber-300">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold dark:bg-amber-800">1</span>
            Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="underline hover:text-amber-900 dark:hover:text-amber-200">Clerk Dashboard</a> and create an application
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold dark:bg-amber-800">2</span>
            Copy your <strong>Publishable key</strong> (starts with <code className="rounded bg-amber-100/50 px-1 font-mono text-xs dark:bg-amber-900/50">pk_</code>)
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold dark:bg-amber-800">3</span>
            Paste it into <code className="rounded bg-amber-100/50 px-1 font-mono text-xs dark:bg-amber-900/50">frontend/.env</code> as <code className="rounded bg-amber-100/50 px-1 font-mono text-xs dark:bg-amber-900/50">VITE_CLERK_PUBLISHABLE_KEY</code>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold dark:bg-amber-800">4</span>
            Set <code className="rounded bg-amber-100/50 px-1 font-mono text-xs dark:bg-amber-900/50">CLERK_SECRET_KEY</code> in <code className="rounded bg-amber-100/50 px-1 font-mono text-xs dark:bg-amber-900/50">backend/.env</code> (Secret key from the same page)
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold dark:bg-amber-800">5</span>
            Restart the dev servers
          </li>
        </ol>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded && !CLERK_MISCONFIGURED) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--background))]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-[rgb(var(--brand))] border-t-transparent" />
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  return <>{children}</>;
}

export default function App() {
  // Show config error when Clerk key is placeholder/missing
  if (CLERK_MISCONFIGURED) {
    return <ClerkMissingBanner />;
  }

  return (
    <Routes>
      {/* Public auth routes with Clerk's prebuilt components */}
      <Route
        path="/login"
        element={
          <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--background))] p-4">
            <div className="w-full max-w-sm">
              <SignIn />
            </div>
          </div>
        }
      />
      <Route
        path="/signup"
        element={
          <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--background))] p-4">
            <div className="w-full max-w-sm">
              <SignUp />
            </div>
          </div>
        }
      />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
