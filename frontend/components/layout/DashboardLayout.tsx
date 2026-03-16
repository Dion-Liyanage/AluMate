"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user } = useAuth();
  const { isCollapsed, setIsCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = (user?.role as "customer" | "admin") || "customer";
  const isAdmin = role === "admin";
  const isDesignStudio = pathname.startsWith("/dashboard/design/studio");
  const hideCustomerSidebar = !isAdmin && isDesignStudio;

  useEffect(() => {
    if (!isAdmin && !isDesignStudio && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isAdmin, isDesignStudio, isCollapsed, setIsCollapsed]);

  const isEffectivelyCollapsed =
    !isAdmin && !hideCustomerSidebar && isCollapsed && !isHovered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Desktop sidebar */}
      {!hideCustomerSidebar && (
        <div
          className="hidden lg:block"
          onMouseEnter={() => !isAdmin && isCollapsed && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Sidebar
            role={role}
            collapsed={isAdmin ? false : isCollapsed}
            onToggle={isAdmin ? () => {} : toggleSidebar}
          />
        </div>
      )}

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
          marginLeft: hideCustomerSidebar ? 0 : isEffectivelyCollapsed ? 72 : 256,
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
