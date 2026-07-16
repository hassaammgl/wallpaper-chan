"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Gallery from "@/components/gallery/gallery";
import { HiMagnifyingGlass, HiRectangleStack } from "react-icons/hi2";

function SearchContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const boardId = searchParams.get("boardId");

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        {boardId ? (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <HiRectangleStack size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-fog">Album</h1>
              <p className="text-sm text-muted">
                Browsing wallpapers in this album
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <HiMagnifyingGlass size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-fog">
                {search ? (
                  <>
                    Results for{" "}
                    <span className="text-gradient">&quot;{search}&quot;</span>
                  </>
                ) : (
                  "Search"
                )}
              </h1>
              <p className="text-sm text-muted">
                Find wallpapers by title or tags
              </p>
            </div>
          </>
        )}
      </div>
      <Gallery search={search} boardId={boardId} />
    </div>
  );
}

function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

export default SearchPage;
