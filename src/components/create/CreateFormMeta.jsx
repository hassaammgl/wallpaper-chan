"use client";

import {
  HiPhoto,
  HiDevicePhoneMobile,
  HiComputerDesktop,
} from "react-icons/hi2";
import { SUGGESTED_TAGS } from "@/components/create/createConstants";

const DEVICE_OPTIONS = [
  { value: "mobile", label: "Mobile", icon: HiDevicePhoneMobile },
  { value: "desktop", label: "Desktop", icon: HiComputerDesktop },
  { value: "both", label: "Both", icon: HiPhoto },
];

export function Field({ id, label, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-muted">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

export function DeviceTypeField({ deviceType, setDeviceType }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted">Device type *</label>
      <div className="grid grid-cols-3 gap-2">
        {DEVICE_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setDeviceType(value)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-all ${
              deviceType === value
                ? "border-accent bg-accent-soft text-accent"
                : "border-line text-muted hover:border-accent/30"
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuickTagsField({ selectedTags, toggleTag }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted">Quick tags</label>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedTags.includes(tag)
                ? "bg-accent-soft text-accent"
                : "border border-line text-muted hover:border-accent/30"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
