"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import {
  HiArrowRightOnRectangle,
  HiUser,
  HiCog6Tooth,
  HiShieldCheck,
} from "react-icons/hi2";

function UserMenu({
  currentUser,
  coords,
  menuRef,
  onClose,
  onLogout,
}) {
  if (!coords || typeof document === "undefined") return null;

  return createPortal(
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
        onClick={onClose}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-fog transition-colors hover:bg-panel-hover"
      >
        <HiUser size={16} className="text-muted" /> Profile
      </Link>
      {currentUser.role === "admin" && (
        <Link
          href="/admin"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-accent transition-colors hover:bg-accent-soft"
        >
          <HiShieldCheck size={16} /> Admin Panel
        </Link>
      )}
      <Link
        href="/settings"
        onClick={onClose}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-fog transition-colors hover:bg-panel-hover"
      >
        <HiCog6Tooth size={16} className="text-muted" /> Settings
      </Link>
      <div className="my-1 h-px bg-line" />
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
      >
        <HiArrowRightOnRectangle size={16} /> Logout
      </button>
    </div>,
    document.body
  );
}

export default UserMenu;
