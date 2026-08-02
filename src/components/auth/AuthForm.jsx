"use client";

import Link from "next/link";
import NextImage from "next/image";

const inputClass =
  "w-full rounded-2xl border border-line bg-canvas/80 px-4 py-3.5 text-fog outline-none transition-all placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

function Field({ id, label, type = "text", placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wider text-muted"
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        id={id}
        required
        name={id}
        className={inputClass}
      />
    </div>
  );
}

export default function AuthForm({
  isRegister,
  setIsRegister,
  loading,
  error,
  onSubmit,
}) {
  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="mb-8 lg:hidden">
        <NextImage
          src="/logo.png"
          alt="Wallpaper-chan"
          width={36}
          height={36}
          className="mb-4 h-9 w-9 object-contain"
        />
        <h1 className="text-2xl font-bold text-gradient">Wallpaper-chan</h1>
      </div>

      <div className="rounded-[28px] border border-line glass p-8 shadow-2xl shadow-black/30">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-fog">
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            {isRegister
              ? "Start sharing your wallpapers today"
              : "Sign in to continue exploring"}
          </p>
        </div>

        <form
          key={isRegister ? "register" : "loginForm"}
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
        >
          {isRegister && (
            <>
              <Field id="userName" label="Username" placeholder="yourname" />
              <Field
                id="displayName"
                label="Display name"
                placeholder="Your Name"
              />
            </>
          )}
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 w-full py-3.5 text-sm"
          >
            {loading
              ? isRegister
                ? "Creating account..."
                : "Signing in..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
          <p className="text-center text-sm text-muted">
            {isRegister ? "Already have an account? " : "New here? "}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="font-semibold text-accent hover:text-accent-hover"
            >
              {isRegister ? "Sign in" : "Create account"}
            </button>
          </p>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        <Link href="/" className="hover:text-fog transition-colors">
          Back to explore
        </Link>
      </p>
    </div>
  );
}
