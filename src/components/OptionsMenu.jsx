"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiEllipsisHorizontal } from "react-icons/hi2";

function OptionsMenu({
  items = [],
  align = "left",
  placement = "bottom",
  buttonClassName = "",
  menuClassName = "",
  iconSize = 18,
  stopPropagation = false,
  onOpenChange,
  "aria-label": ariaLabel = "More options",
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  const setMenuOpen = (next) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open || !rootRef.current) {
      setCoords(null);
      return;
    }

    const update = () => {
      const rect = rootRef.current.getBoundingClientRect();
      const menuWidth = 190;
      const menuHeight = menuRef.current?.offsetHeight || 220;
      const gap = 8;
      const pad = 8;

      let left = align === "right" ? rect.right - menuWidth : rect.left;
      left = Math.max(pad, Math.min(left, window.innerWidth - menuWidth - pad));

      const spaceBelow = window.innerHeight - rect.bottom - gap - pad;
      const spaceAbove = rect.top - gap - pad;
      let preferTop = placement === "top";

      if (placement === "bottom" && spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        preferTop = true;
      } else if (placement === "top" && spaceAbove < menuHeight && spaceBelow > spaceAbove) {
        preferTop = false;
      }

      setCoords({
        left,
        top: preferTop ? rect.top - gap : rect.bottom + gap,
        preferTop,
        width: menuWidth,
      });
    };

    update();
    // Re-measure after menu mounts so height-based flipping is accurate
    const raf = requestAnimationFrame(update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, align, placement]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (
        rootRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return;
      }
      setMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
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

  const menu =
    open &&
    coords &&
    typeof document !== "undefined" &&
    createPortal(
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
              setMenuOpen(false);
              item.onClick?.(e);
            }}
          >
            {item.icon ? <span className="text-muted">{item.icon}</span> : null}
            {item.label}
          </button>
        ))}
      </div>,
      document.body
    );

  return (
    <div ref={rootRef} className="relative shrink-0">
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
          setMenuOpen(!open);
        }}
      >
        <HiEllipsisHorizontal size={iconSize} />
      </button>
      {menu}
    </div>
  );
}

export default OptionsMenu;
