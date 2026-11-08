"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Toaster from "./Toaster";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/bienvenida";

  return (
    <>
      {isLanding ? (
        children
      ) : (
        <div className="app-shell">
          <Sidebar />
          <main className="main-panel">{children}</main>
        </div>
      )}
      <Toaster />
    </>
  );
}
