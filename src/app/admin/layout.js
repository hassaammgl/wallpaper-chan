"use client";

import { useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { useSession, signOut } from "@/lib/auth-client";
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

const navItems = [
  { to: "/admin", label: "Overview", icon: HiChartBarSquare, end: true },
  { to: "/admin/pins", label: "Wallpapers", icon: HiPhoto },
  { to: "/admin/albums", label: "Albums", icon: HiRectangleStack },
  { to: "/create", label: "Upload", icon: HiPlusCircle },
  { to: "/admin/users", label: "Users", icon: HiUsers },
  { to: "/admin/comments", label: "Comments", icon: HiChatBubbleLeftRight },
  { to: "/admin/settings", label: "CDN Settings", icon: HiCog6Tooth },
];

function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, removeCurrentUser, setCurrentUser } = useAuthStore();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      setCurrentUser(session.user);
      if (session.user.role !== "admin") {
        router.replace("/");
      }
      return;
    }

    removeCurrentUser();
    router.replace("/auth");
  }, [session, isPending, router, setCurrentUser, removeCurrentUser]);

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      removeCurrentUser();
      router.push("/auth");
    }
  };

  if (isPending) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-canvas text-fog">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-parrot/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-lime/8 blur-3xl" />
      </div>

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
          {navItems.map(({ to, label, icon: Icon, end }) => {
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
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/20"
            >
              <HiArrowRightOnRectangle size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="relative ml-64 min-h-screen">
        <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 px-6 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Control center
              </p>
              <h1 className="text-lg font-semibold text-fog">
                {navItems.find((item) =>
                  item.end ? pathname === item.to : pathname.startsWith(item.to)
                )?.label || "Admin"}
              </h1>
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

export default AdminLayout;
