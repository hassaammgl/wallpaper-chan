"use client";

import { useState } from "react";
import Gallery from "@/components/gallery/gallery";

const filters = [
  { id: "all", label: "All" },
  { id: "mobile", label: "Mobile" },
  { id: "desktop", label: "Desktop" },
];

function HomePage() {
  const [deviceType, setDeviceType] = useState("all");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-fog sm:text-2xl">
          Wallpapers
        </h1>
        <div className="flex gap-1 rounded-xl border border-line bg-panel/50 p-1">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDeviceType(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                deviceType === id
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:text-fog"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <Gallery deviceType={deviceType === "all" ? undefined : deviceType} />
    </div>
  );
}

export default HomePage;
