"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Wrench,
  User,
  Package,
  Users,
  BarChart3,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Palette,
  PenTool,
  Save,
  Grid3X3,
  ShoppingCart,
  Ruler,
  Hammer,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  role: "customer" | "admin";
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

const customerMenuGroups: MenuGroup[] = [
  {
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    title: "Design",
    items: [
      { href: "/dashboard/design", icon: PenTool, label: "New Design" },
      { href: "/dashboard/catalogue", icon: Grid3X3, label: "Design Catalogue" },
    ],
  },
  {
    title: "Orders",
    items: [
      { href: "/dashboard/orders", icon: ShoppingCart, label: "My Orders" },
      { href: "/dashboard/quotations", icon: FileText, label: "Quotations" },
    ],
  },
  {
    title: "Services",
    items: [
      { href: "/dashboard/services/measurement", icon: Ruler, label: "Measurement Requests" },
      { href: "/dashboard/services/maintenance", icon: Hammer, label: "Maintenance / Repairs" },
    ],
  },
  {
    title: "More",
    items: [
      { href: "/dashboard/projects", icon: FolderOpen, label: "Past Projects" },
      { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
      { href: "/profile", icon: User, label: "Profile" },
    ],
  },
];

const adminMenuItems: MenuItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: ClipboardList, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/inventory", icon: Package, label: "Inventory" },
  { href: "/admin/quotations", icon: FileText, label: "Quotations" },
  { href: "/admin/services", icon: Wrench, label: "Services" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
];

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderLink = (item: MenuItem) => {
    const active = isActive(item.href);
    const linkContent = (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          active
            ? "bg-zinc-800/80 text-white shadow-[0_0_10px_rgba(161,161,170,0.1)]"
            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
        )}
      >
        <item.icon
          className={cn(
            "h-5 w-5 shrink-0",
            active ? "text-zinc-200" : "text-zinc-500"
          )}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-zinc-800 text-zinc-100 border-zinc-700"
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.href}>{linkContent}</div>;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-40 h-screen bg-zinc-950 border-r border-zinc-800/50 flex flex-col"
      >
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-zinc-800/50 px-4">
          <Link
            href={role === "admin" ? "/admin" : "/dashboard"}
            className="flex items-center gap-3"
          >
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-zinc-400 via-zinc-300 to-zinc-500 shadow-[0_0_20px_rgba(161,161,170,0.3)]" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-lg font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
                >
                  AluMate
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {role === "admin" ? (
            /* Admin: flat list */
            <div className="space-y-1">
              {adminMenuItems.map((item) => renderLink(item))}
            </div>
          ) : (
            /* Customer: grouped sections */
            <div className="space-y-5">
              {customerMenuGroups.map((group, idx) => (
                <div key={group.title || idx}>
                  {group.title && !collapsed && (
                    <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      {group.title}
                    </p>
                  )}
                  {group.title && collapsed && (
                    <Separator className="bg-zinc-800/50 my-2" />
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => renderLink(item))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>

        <Separator className="bg-zinc-800/50" />

        {/* Collapse toggle */}
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
