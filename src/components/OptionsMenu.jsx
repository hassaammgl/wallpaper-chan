"use client";

import { useEffect, useRef, useState } from "react";
import { HiEllipsisHorizontal } from "react-icons/hi2";

function OptionsMenu({
  items = [],
  align = "left",
  placement = "bottom",
  buttonClassName = "",
  menuClassName = "",
  iconSize = 18,
  stopPropagation = false,
  "aria-label": ariaLabel = "More options",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
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

  const visibleItems = items.filter(Boolean);

  if (!visibleItems.length) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        className={buttonClassName}
        onClick={(e) => {
          if (stopPropagation) {
            e.preventDefault();
            e.stopPropagation();
          }
          setOpen((v) => !v);
        }}
      >
        <HiEllipsisHorizontal size={iconSize} />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 min-w-[180px] overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl shadow-black/40 ${
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          } ${align === "right" ? "right-0" : "left-0"} ${menuClassName}`}
        >
          {visibleItems.map((item) => (
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
                setOpen(false);
                item.onClick?.(e);
              }}
            >
              {item.icon ? <span className="text-muted">{item.icon}</span> : null}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default OptionsMenu;
