"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiChartBarSquare,
  HiUsers,
  HiPhoto,
  HiChatBubbleLeftRight,
  HiArrowRightOnRectangle,
  HiShieldCheck,
  HiCog6Tooth,
  HiRectangleStack,
  HiPlusCircle,
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";

export const adminNavItems = [
  { to: "/admin", label: "Overview", icon: HiChartBarSquare, end: true },
  { to: "/admin/pins", label: "Wallpapers", icon: HiPhoto },
  { to: "/admin/albums", label: "Albums", icon: HiRectangleStack },
  { to: "/create", label: "Upload", icon: HiPlusCircle },
  { to: "/admin/users", label: "Users", icon: HiUsers },
  { to: "/admin/comments", label: "Comments", icon: HiChatBubbleLeftRight },
  { to: "/admin/settings", label: "CDN Settings", icon: HiCog6Tooth },
];

function AdminNav({ currentUser, onLogout }) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-line/80 bg-panel/90 backdrop-blur-xl">
      <div className="border-b border-line/80 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent ring-1 ring-accent/20">
            <HiShieldCheck size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight text-fog">
              Admin Studio
            </p>
            <p className="truncate text-[11px] text-muted">Wallpaper-chan</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Manage
        </p>
        {adminNavItems.map(({ to, label, icon: Icon, end }) => {
          const isActive = end ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              href={to}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent text-ink shadow-lg shadow-accent/20"
                  : "text-muted hover:bg-panel-hover hover:text-fog"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-line/80 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-2xl border border-line px-3 py-2.5 text-sm text-muted transition-colors hover:border-accent/30 hover:text-fog"
        >
          <HiArrowTopRightOnSquare size={16} />
          View site
        </Link>
        <div className="rounded-2xl border border-line bg-canvas/50 p-3">
          <p className="truncate text-sm font-medium text-fog">
            {currentUser?.displayName || currentUser?.name}
          </p>
          <p className="truncate text-xs text-muted">{currentUser?.email}</p>
          <button
            onClick={onLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/20"
          >
            <HiArrowRightOnRectangle size={16} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminNav;
