"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import NotificationList from "@/components/customer/NotificationList";

export default function NotificationsPage() {
  return (
    <DashboardLayout title="Notifications">
      <div className="mx-auto max-w-3xl">
        <NotificationList />
      </div>
    </DashboardLayout>
  );
}
