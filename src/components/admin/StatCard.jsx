"use client";

import Link from "next/link";

function StatCard({ label, value, icon: Icon, href }) {
  const content = (
    <div className="group rounded-[22px] border border-line bg-panel/60 p-5 transition-all hover:border-accent/30 hover:bg-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-fog">
            {value?.toLocaleString() ?? "—"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform group-hover:scale-105">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default StatCard;
