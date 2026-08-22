import type { Metadata } from "next";
import { AdminApp } from "@/features/admin/AdminApp";

export const metadata: Metadata = {
  title: "Панель управления",
  // Страница не должна попадать ни в поиск, ни в sitemap.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminApp />;
}
