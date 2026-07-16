"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { signUp } from "@/lib/auth-client";
import useAuthStore from "@/stores/authStore";
import { HiSparkles } from "react-icons/hi2";

function RegisterPage() {
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
      setCurrentUser(res.data?.user || { email: data.email, userName: data.userName, displayName: data.displayName });
      router.push("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-line bg-canvas/80 px-4 py-3.5 text-fog outline-none transition-all placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

  return (
    <div className="mesh-bg flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 bg-linear-to-br from-parrot/15 via-transparent to-lime/10" />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-parrot/15 blur-3xl animate-float" />
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
            Curate, discover, and share stunning wallpapers.
          </p>
          <div className="flex items-center gap-3 text-sm text-muted">
            <HiSparkles className="text-lime" size={18} />
            <span>Join thousands of creators sharing their art</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-up">
          <div className="rounded-[28px] border border-line glass p-8 shadow-2xl shadow-black/30">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-fog">Create your account</h2>
              <p className="mt-1.5 text-sm text-muted">Start sharing your wallpapers today</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="userName" className="text-xs font-medium uppercase tracking-wider text-muted">Username</label>
                <input type="text" placeholder="yourname" id="userName" required name="userName" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="displayName" className="text-xs font-medium uppercase tracking-wider text-muted">Display name</label>
                <input type="text" placeholder="Your Name" required name="displayName" id="displayName" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted">Email</label>
                <input type="email" placeholder="you@example.com" required name="email" id="email" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted">Password</label>
                <input type="password" placeholder="••••••••" required name="password" id="password" className={inputClass} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-3.5 text-sm">
                {loading ? "Creating account..." : "Create account"}
              </button>
              <p className="text-center text-sm text-muted">
                Already have an account?{" "}
                <Link href="/auth" className="font-semibold text-accent hover:text-accent-hover">Sign in</Link>
              </p>
            </form>

            {error && (
              <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
