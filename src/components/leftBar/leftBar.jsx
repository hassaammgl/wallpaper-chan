"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import {
  HiHome,
  HiPlusCircle,
  HiBell,
  HiCog6Tooth,
} from "react-icons/hi2";

const baseNavItems = [
  { to: "/", icon: HiHome, label: "Home" },
  { to: "/alerts", icon: HiBell, label: "Alerts" },
];

function NavLinks({ pathname, isAdmin = false }) {
  const navItems = isAdmin
    ? [
        baseNavItems[0],
        { to: "/create", icon: HiPlusCircle, label: "Upload" },
        ...baseNavItems.slice(1),
      ]
    : baseNavItems;

  return navItems.map(({ to, icon: Icon, label }) => {
    const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
    return (
      <Link
        key={label}
        href={to}
        title={label}
        aria-label={label}
        className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
          isActive
            ? "bg-accent text-ink shadow-lg shadow-accent/25"
            : "text-muted hover:bg-panel-hover hover:text-fog"
        }`}
      >
        <Icon size={20} />
      </Link>
    );
  });
}

function LeftBar() {
  const pathname = usePathname();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "admin";

  return (
    <>
      <aside className="fixed top-4 left-4 bottom-4 z-50 hidden w-[68px] flex-col items-center justify-between overflow-visible rounded-[28px] border border-line/80 bg-panel/90 py-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:flex">
        <div className="flex flex-col items-center gap-1.5">
          <Link
            href="/"
            title="Wallpaper-chan"
            className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl transition-all hover:bg-panel-hover"
          >
            <NextImage
              src="/logo.png"
              alt="Wallpaper-chan"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </Link>
          <NavLinks pathname={pathname} isAdmin={isAdmin} />
        </div>

        <Link
          href="/settings"
          title="Settings"
          aria-label="Settings"
          className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
            pathname.startsWith("/settings")
              ? "bg-accent text-ink shadow-lg shadow-accent/25"
              : "text-muted hover:bg-panel-hover hover:text-fog"
          }`}
        >
          <HiCog6Tooth size={20} />
        </Link>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-[24px] border border-line/80 bg-panel/95 px-2 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl md:hidden">
        <NavLinks pathname={pathname} isAdmin={isAdmin} />
        <Link
          href="/settings"
          title="Settings"
          aria-label="Settings"
          className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
            pathname.startsWith("/settings")
              ? "bg-accent text-ink"
              : "text-muted hover:bg-panel-hover hover:text-fog"
          }`}
        >
          <HiCog6Tooth size={20} />
        </Link>
      </nav>
    </>
  );
}

export default LeftBar;
