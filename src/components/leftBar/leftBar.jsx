"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import {
  HiHome,
  HiPlusCircle,
  HiBell,
  HiChatBubbleLeftRight,
  HiCog6Tooth,
} from "react-icons/hi2";

const baseNavItems = [
  { to: "/", icon: HiHome, label: "Home" },
  { to: "/alerts", icon: HiBell, label: "Alerts" },
  { to: "/messages", icon: HiChatBubbleLeftRight, label: "Messages" },
];

function NavLinks({ pathname, className = "", isAdmin = false }) {
  const navItems = isAdmin
    ? [
        baseNavItems[0],
        { to: "/create", icon: HiPlusCircle, label: "Create" },
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
        className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
          isActive
            ? "bg-accent-soft text-accent glow-ring"
            : "text-muted hover:bg-panel-hover hover:text-fog"
        } ${className}`}
      >
        <Icon size={22} />
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
      <aside className="fixed top-4 left-4 bottom-4 z-50 hidden w-[60px] flex-col items-center justify-between rounded-[28px] glass py-5 shadow-2xl shadow-black/40 md:flex">
        <div className="flex flex-col items-center gap-1">
          <Link
            href="/"
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
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-muted transition-all hover:bg-panel-hover hover:text-fog"
        >
          <HiCog6Tooth size={22} />
        </Link>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-[24px] glass px-2 py-2 shadow-2xl shadow-black/40 md:hidden">
        <NavLinks pathname={pathname} isAdmin={isAdmin} />
        <Link
          href="/settings"
          title="Settings"
          className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
            pathname.startsWith("/settings")
              ? "bg-accent-soft text-accent glow-ring"
              : "text-muted hover:bg-panel-hover hover:text-fog"
          }`}
        >
          <HiCog6Tooth size={22} />
        </Link>
      </nav>
    </>
  );
}

export default LeftBar;
