import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/categories": "Categories",
  "/profile": "Profile",
};

export function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Expense Tracker";

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <Sidebar />
      <BottomNav />

      <div className="lg:pl-60 pb-16 lg:pb-0">
        <Header title={title} />

        <main className="p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
