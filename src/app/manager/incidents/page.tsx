import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IncidentsContainer } from "@/components/incidents/IncidentsContainer";

export default function IncidentsPage() {
  return (
    <DashboardLayout>
      <IncidentsContainer />
    </DashboardLayout>
  );
}
