"use client";

import LeftBar from "@/components/leftBar/leftBar";
import TopBar from "@/components/topBar/topBar";

function MainLayout({ children }) {
  return (
    <div className="mesh-bg min-h-screen">
      <LeftBar />
      <div className="flex flex-col min-h-screen pl-[88px] pr-4 md:pr-6 lg:pr-8">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-8 animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
