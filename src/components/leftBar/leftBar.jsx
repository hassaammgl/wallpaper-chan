"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiHome,
  HiPlusCircle,
  HiBell,
  HiChatBubbleLeftRight,
  HiCog6Tooth,
} from "react-icons/hi2";

const navItems = [
  { to: "/", icon: HiHome, label: "Home" },
  { to: "/create", icon: HiPlusCircle, label: "Create" },
  { to: "/", icon: HiBell, label: "Alerts" },
  { to: "/", icon: HiChatBubbleLeftRight, label: "Messages" },
];

function LeftBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-4 left-4 bottom-4 z-50 flex w-[60px] flex-col items-center justify-between rounded-[28px] glass py-5 shadow-2xl shadow-black/40">
      <div className="flex flex-col items-center gap-1">
        <Link
          href="/"
          className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl transition-all hover:bg-panel-hover"
        >
          <img src="/logo.png" className="h-7 w-7 object-contain" />
        </Link>

        {navItems.map(({ to, icon: Icon, label }) => {
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
              }`}
            >
              <Icon size={22} />
            </Link>
          );
        })}
      </div>

      <Link
        href="/"
        title="Settings"
        className="flex h-11 w-11 items-center justify-center rounded-2xl text-muted transition-all hover:bg-panel-hover hover:text-fog"
      >
        <HiCog6Tooth size={22} />
      </Link>
    </aside>
  );
}

export default LeftBar;
