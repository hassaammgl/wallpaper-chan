"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "@/components/Image/Image";
import { signOut } from "@/lib/auth-client";
import useAuthStore from "@/stores/authStore";
import {
  HiChevronDown,
  HiArrowRightOnRectangle,
  HiUser,
  HiCog6Tooth,
  HiShieldCheck,
} from "react-icons/hi2";

function UserButton() {
  const { currentUser, removeCurrentUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      removeCurrentUser();
      router.push("/auth");
    }
  };

  return currentUser ? (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-[20px] border border-line bg-panel/80 py-1.5 pl-1.5 pr-3 transition-all hover:border-accent/30 hover:bg-panel-hover"
      >
        <Image
          path={currentUser.img || "/general/noAvatar.png"}
          alt="avatar"
          w={36}
          h={36}
          className="h-9 w-9 rounded-xl object-cover ring-2 ring-accent/20"
        />
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-fog lg:block">
          {currentUser.displayName || currentUser.userName}
        </span>
        <HiChevronDown
          size={14}
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[180px] overflow-hidden rounded-2xl border border-line glass p-1.5 shadow-2xl shadow-black/50">
            <Link
              href={`/${currentUser.userName}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-fog transition-colors hover:bg-panel-hover"
            >
              <HiUser size={16} className="text-muted" /> Profile
            </Link>
            {currentUser.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-accent transition-colors hover:bg-accent-soft"
              >
                <HiShieldCheck size={16} /> Admin Panel
              </Link>
            )}
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-fog transition-colors hover:bg-panel-hover"
            >
              <HiCog6Tooth size={16} className="text-muted" /> Settings
            </Link>
            <div className="my-1 h-px bg-line" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
            >
              <HiArrowRightOnRectangle size={16} /> Logout
            </button>
          </div>
        </>
      )}
    </div>
  ) : (
    <Link
      href="/auth"
      className="btn-primary inline-flex px-5 py-3 text-sm"
    >
      Sign in
    </Link>
  );
}

export default UserButton;
