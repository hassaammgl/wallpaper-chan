"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminNav, { adminNavItems } from "./AdminNav";

function AdminShell({ children, currentUser, onLogout }) {
  const pathname = usePathname();
  const activeLabel =
    adminNavItems.find((item) =>
      item.end ? pathname === item.to : pathname.startsWith(item.to)
    )?.label || "Admin";

  return (
    <div className="relative min-h-screen bg-canvas text-fog">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-parrot/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-lime/8 blur-3xl" />
      </div>

      <AdminNav currentUser={currentUser} onLogout={onLogout} />

      <div className="relative ml-64 min-h-screen">
        <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 px-6 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Control center
              </p>
              <h1 className="text-lg font-semibold text-fog">{activeLabel}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/create"
                className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex"
              >
                New wallpaper
              </Link>
              <Link
                href="/admin/albums"
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fog transition-colors hover:bg-panel-hover"
              >
                Albums
              </Link>
            </div>
          </div>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default AdminShell;
