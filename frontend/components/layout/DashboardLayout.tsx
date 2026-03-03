"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = (user?.role as "customer" | "admin") || "customer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          role={role}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-zinc-950 border-zinc-800"
        >
          <Sidebar
            role={role}
            collapsed={false}
            onToggle={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <motion.div
        initial={false}
        animate={{
          marginLeft: sidebarCollapsed ? 72 : 256,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:block"
      >
        <div className="min-h-screen">
          <TopNav
            title={title}
            onMenuToggle={() => setMobileMenuOpen(true)}
          />
          <main className="p-6">{children}</main>
        </div>
      </motion.div>

      {/* Mobile content — no sidebar offset */}
      <div className="lg:hidden min-h-screen">
        <TopNav
          title={title}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
