import { OnSiteVisitForm } from "@/components/services/OnSiteVisitForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function OnSiteVisitPage() {
  return (
    <DashboardLayout title="Request On-Site Visit">
      <div className="container mx-auto max-w-4xl py-6">
        <OnSiteVisitForm />
      </div>
    </DashboardLayout>
  );
}
