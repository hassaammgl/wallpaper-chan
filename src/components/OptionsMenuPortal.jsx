"use client";

import { createPortal } from "react-dom";

export default function OptionsMenuPortal({
  menuRef,
  coords,
  items,
  menuClassName,
  stopPropagation,
  onItemClick,
}) {
  if (!coords || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: "fixed",
        left: coords.left,
        top: coords.preferTop ? undefined : coords.top,
        bottom: coords.preferTop
          ? window.innerHeight - coords.top
          : undefined,
        width: coords.width,
        zIndex: 9999,
      }}
      className={`overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl shadow-black/50 ${menuClassName}`}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          className={`flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm transition-colors disabled:opacity-40 ${
            item.danger
              ? "text-danger hover:bg-danger/10"
              : "text-fog hover:bg-panel-hover"
          }`}
          onClick={(e) => {
            if (stopPropagation) {
              e.preventDefault();
              e.stopPropagation();
            }
            onItemClick(item, e);
          }}
        >
          {item.icon ? <span className="text-muted">{item.icon}</span> : null}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
}
