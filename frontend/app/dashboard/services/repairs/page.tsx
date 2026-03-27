import { RepairForm } from "@/components/services/repairs/RepairForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function RepairServicePage() {
  return (
    <DashboardLayout title="Request Repair Service">
      <div className="container mx-auto max-w-4xl py-6">
        <RepairForm />
      </div>
    </DashboardLayout>
  );
}
