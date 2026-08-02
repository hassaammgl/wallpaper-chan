"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { useSession, signOut } from "@/lib/auth-client";
import AdminShell from "@/components/admin/AdminShell";

function AdminLayout({ children }) {
  const router = useRouter();
  const { currentUser, removeCurrentUser, setCurrentUser } = useAuthStore();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      setCurrentUser(session.user);
      if (session.user.role !== "admin") {
        router.replace("/");
      }
      return;
    }

    removeCurrentUser();
    router.replace("/auth");
  }, [session, isPending, router, setCurrentUser, removeCurrentUser]);

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      removeCurrentUser();
      router.push("/auth");
    }
  };

  if (isPending) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return (
    <AdminShell currentUser={currentUser} onLogout={handleLogout}>
      {children}
    </AdminShell>
  );
}

export default AdminLayout;
