"use client";

import { useEffect } from "react";
import LeftBar from "@/components/leftBar/leftBar";
import TopBar from "@/components/topBar/topBar";
import { useSession } from "@/lib/auth-client";
import useAuthStore from "@/stores/authStore";

function MainLayout({ children }) {
  const { data: session, isPending } = useSession();
  const { setCurrentUser, removeCurrentUser } = useAuthStore();

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      if (session.user.blocked) {
        removeCurrentUser();
        return;
      }
      setCurrentUser(session.user);
      return;
    }

    removeCurrentUser();
  }, [session, isPending, setCurrentUser, removeCurrentUser]);

  return (
    <div className="mesh-bg min-h-screen">
      <LeftBar />
      <div className="flex min-h-screen flex-col px-4 pb-24 md:pl-[88px] md:pr-6 md:pb-8 lg:pr-8">
        <TopBar />
        <main className="flex-1 animate-fade-up overflow-y-auto pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
