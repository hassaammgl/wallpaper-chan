"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "@/components/Image/Image";
import { signOut } from "@/lib/auth-client";
import useAuthStore from "@/stores/authStore";
import { HiChevronDown } from "react-icons/hi2";
import UserMenu from "./UserMenu";

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
      {open && (
        <UserMenu
          currentUser={currentUser}
          coords={coords}
          menuRef={menuRef}
          onClose={() => setOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default UserButton;
