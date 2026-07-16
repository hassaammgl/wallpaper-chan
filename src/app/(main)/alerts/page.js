"use client";

import { HiBell } from "react-icons/hi2";

function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
          <HiBell size={14} />
          Alerts
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-fog">
          Notifications
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-line glass py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-panel">
          <HiBell size={28} className="text-muted" />
        </div>
        <p className="text-lg font-medium text-fog">No notifications yet</p>
        <p className="max-w-sm text-sm text-muted">
          When someone interacts with your wallpapers or follows you, you&apos;ll
          see it here.
        </p>
      </div>
    </div>
  );
}

export default AlertsPage;
