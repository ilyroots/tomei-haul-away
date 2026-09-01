import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { AdminSidebar } from "./components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <AdminSidebar adminEmail={session.user.email} adminName={session.user.name} />
      <div className="lg:ml-64">
        <main id="main-content" className="min-h-screen p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
