"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { signIn, signUp } from "@/lib/auth-client";
import useAuthStore from "@/stores/authStore";
import AuthForm from "@/components/auth/AuthForm";
import { HiSparkles } from "react-icons/hi2";

function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCurrentUser, currentUser } = useAuthStore();

  useEffect(() => {
    if (currentUser) router.push("/");
  }, [currentUser, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      if (isRegister) {
        const res = await signUp.email({
          email: data.email,
          password: data.password,
          name: data.displayName,
          userName: data.userName,
        });
        if (res.error) {
          setError(res.error.message || "Registration failed");
          return;
        }
        setCurrentUser(
          res.data?.user || {
            email: data.email,
            userName: data.userName,
            displayName: data.displayName,
          },
        );
      } else {
        const res = await signIn.email({
          email: data.email,
          password: data.password,
        });
        if (res.error) {
          setError(res.error.message || "Login failed");
          return;
        }
        const user = res.data?.user;
        if (user?.blocked) {
          setError("This account has been blocked. Contact support.");
          return;
        }
        setCurrentUser(user);
      }
      router.push("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 bg-linear-to-br from-parrot/15 via-transparent to-lime/10" />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-parrot/15 blur-3xl animate-float" />
        <div
          className="absolute -right-10 bottom-1/4 h-64 w-64 rounded-full bg-lime/10 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10">
          <NextImage
            src="/logo.png"
            alt="Wallpaper-chan"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            <span className="text-gradient">Wallpaper-chan</span>
          </h1>
          <p className="max-w-md text-lg text-muted leading-relaxed">
            Curate, discover, and share stunning wallpapers. Your personal
            canvas for visual inspiration.
          </p>
          <div className="flex items-center gap-3 text-sm text-muted">
            <HiSparkles className="text-lime" size={18} />
            <span>Join thousands of creators sharing their art</span>
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted/60">
          2026 Wallpaper-chan
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <AuthForm
          isRegister={isRegister}
          setIsRegister={setIsRegister}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default AuthPage;
