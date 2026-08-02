const MENU_WIDTH = 190;
const GAP = 8;
const PAD = 8;

export function calcMenuCoords(rect, menuHeight, { align, placement }) {
  let left = align === "right" ? rect.right - MENU_WIDTH : rect.left;
  left = Math.max(PAD, Math.min(left, window.innerWidth - MENU_WIDTH - PAD));

  const spaceBelow = window.innerHeight - rect.bottom - GAP - PAD;
  const spaceAbove = rect.top - GAP - PAD;
  let preferTop = placement === "top";

  if (placement === "bottom" && spaceBelow < menuHeight && spaceAbove > spaceBelow) {
    preferTop = true;
  } else if (placement === "top" && spaceAbove < menuHeight && spaceBelow > spaceAbove) {
    preferTop = false;
  }

  return {
    left,
    top: preferTop ? rect.top - GAP : rect.bottom + GAP,
    preferTop,
    width: MENU_WIDTH,
  };
}
