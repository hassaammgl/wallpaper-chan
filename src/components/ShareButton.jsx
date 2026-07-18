"use client";

import { useState } from "react";
import { HiShare, HiCheck } from "react-icons/hi2";
import { shareContent } from "@/lib/share";

function ShareButton({
  title,
  text,
  url,
  className = "",
  iconSize = 18,
  label,
  stopPropagation = false,
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleShare = async (e) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (busy) return;
    setBusy(true);
    try {
      const result = await shareContent({ title, text, url });
      if (result.method === "clipboard") {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={busy}
      title={copied ? "Link copied" : "Share"}
      aria-label={copied ? "Link copied" : "Share"}
      className={className}
    >
      {copied ? <HiCheck size={iconSize} /> : <HiShare size={iconSize} />}
      {label ? <span>{copied ? "Copied" : label}</span> : null}
    </button>
  );
}

export default ShareButton;
