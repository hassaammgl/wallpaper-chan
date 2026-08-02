"use client";

import { useEffect, useRef, useState } from "react";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import OptionsMenuPortal from "@/components/OptionsMenuPortal";
import { calcMenuCoords } from "@/lib/optionsMenuPosition";

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
      const menuHeight = menuRef.current?.offsetHeight || 220;
      setCoords(calcMenuCoords(rect, menuHeight, { align, placement }));
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
      {open ? (
        <OptionsMenuPortal
          menuRef={menuRef}
          coords={coords}
          items={visibleItems}
          menuClassName={menuClassName}
          stopPropagation={stopPropagation}
          onItemClick={(item, e) => {
            setMenuOpen(false);
            item.onClick?.(e);
          }}
        />
      ) : null}
    </div>
  );
}

export default OptionsMenu;
