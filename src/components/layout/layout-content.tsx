'use client';

import { useLocation } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Toaster } from "@/components/ui/sonner";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isPortalRoute = pathname?.startsWith('/portal');
  const isPublicRoute = pathname === '/login';

  if (isPublicRoute) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  // Portal routes have their own layout with sidebar
  if (isPortalRoute) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  // Admin routes use the sidebar/header layout
  return (
    <div className="min-h-screen bg-credaly-bg font-sans text-credaly-text">
      <Sidebar />
      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main id="main-content" className="p-6 sm:p-8 lg:p-9 flex-1 overflow-y-auto" role="main">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
