"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [coords, setCoords] = useState(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!open || !rootRef.current) {
      setCoords(null);
      return;
    }

    const update = () => {
      const rect = rootRef.current.getBoundingClientRect();
      const width = 200;
      const left = Math.max(
        8,
        Math.min(rect.right - width, window.innerWidth - width - 8)
      );
      setCoords({
        left,
        top: rect.bottom + 8,
        width,
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (
        rootRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      removeCurrentUser();
      router.push("/auth");
    }
  };

  if (!currentUser) {
    return (
      <Link
        href="/auth"
        className="btn-primary inline-flex shrink-0 px-5 py-3 text-sm"
      >
        Sign in
      </Link>
    );
  }

  const menu =
    open &&
    coords &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          left: coords.left,
          top: coords.top,
          width: coords.width,
          zIndex: 9999,
        }}
        className="overflow-hidden rounded-2xl border border-line glass p-1.5 shadow-2xl shadow-black/50"
      >
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
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
        >
          <HiArrowRightOnRectangle size={16} /> Logout
        </button>
      </div>,
      document.body
    );

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-[20px] border border-line bg-panel/80 py-1.5 pl-1.5 pr-3 transition-all hover:border-accent/30 hover:bg-panel-hover"
      >
        <Image
          path={currentUser.img || "/general/noAvatar.svg"}
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
      {menu}
    </div>
  );
}

export default UserButton;
