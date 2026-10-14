import Header from "@/components/Header";
import MaintenanceClient from "./components/MaintenanceClient";

export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  return (
    <>
      <Header title="نگهداری" />
      <MaintenanceClient />
    </>
  );
}