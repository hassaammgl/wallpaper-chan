"use client";

import { useState } from "react";
import Gallery from "@/components/gallery/gallery";
import { HiSparkles, HiDevicePhoneMobile, HiComputerDesktop } from "react-icons/hi2";

const filters = [
  { id: "all", label: "All", icon: HiSparkles },
  { id: "mobile", label: "Mobile", icon: HiDevicePhoneMobile },
  { id: "desktop", label: "Desktop", icon: HiComputerDesktop },
];

function HomePage() {
  const [deviceType, setDeviceType] = useState("all");

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
            <HiSparkles size={14} />
            For you
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-fog md:text-4xl">
            Discover <span className="text-gradient">wallpapers</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Full HD originals — optimized preview, raw download
          </p>
        </div>

        <div className="flex gap-1 rounded-2xl border border-line bg-panel/50 p-1">
          {filters.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDeviceType(id)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                deviceType === id
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:text-fog"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </section>
      <Gallery deviceType={deviceType === "all" ? undefined : deviceType} />
    </div>
  );
}

export default HomePage;
