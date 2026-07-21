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
      <div className="relative z-0 flex min-h-screen flex-col px-4 pb-28 md:pl-[100px] md:pr-6 md:pb-8 lg:pr-8">
        <TopBar />
        <main className="relative z-0 flex-1 pb-6 md:pb-8">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
