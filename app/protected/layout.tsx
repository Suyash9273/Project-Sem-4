import AppSidebarLayout from "@/components/layout/AppSidebarLayout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppSidebarLayout>
      {children}
    </AppSidebarLayout>
  );
}