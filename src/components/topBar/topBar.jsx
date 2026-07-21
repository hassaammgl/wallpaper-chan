"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMagnifyingGlass, HiSparkles } from "react-icons/hi2";
import UserButton from "@/components/userButton/userButton";

function TopBar() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = e.target[0].value.trim();
    if (value) router.push(`/search?search=${encodeURIComponent(value)}`);
  };

  return (
    <header className="sticky top-0 z-40 -mx-4 mb-1 flex items-center gap-3 bg-canvas/90 px-4 py-4 backdrop-blur-xl md:-mx-0 md:gap-4 md:bg-transparent md:px-0 md:backdrop-blur-none">
      <form
        onSubmit={handleSubmit}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-[20px] border border-line bg-panel/70 px-4 py-3 transition-all focus-within:border-accent/40 focus-within:glow-ring sm:px-5 sm:py-3.5"
      >
        <HiMagnifyingGlass
          size={18}
          className="shrink-0 text-muted transition-colors group-focus-within:text-accent"
        />
        <input
          type="text"
          placeholder="Search wallpapers, tags, artists..."
          className="min-w-0 flex-1 bg-transparent text-sm text-fog outline-none placeholder:text-muted sm:text-base"
        />
        <kbd className="hidden rounded-lg border border-line bg-canvas px-2 py-0.5 font-mono text-[10px] text-muted sm:inline">
          /
        </kbd>
      </form>

      <Link
        href="/"
        className="hidden shrink-0 items-center gap-2 rounded-[20px] border border-accent/25 bg-accent-soft px-4 py-3 text-sm font-medium text-accent transition-all hover:border-accent/40 hover:bg-accent hover:text-ink md:flex"
      >
        <HiSparkles size={16} />
        Discover
      </Link>

      <UserButton />
    </header>
  );
}

export default TopBar;
