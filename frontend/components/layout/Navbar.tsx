"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Feather, User, Settings, LogOut } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <nav className="fixed w-full h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-md top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Feather className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            Write Like Me
            <span className="pl-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="/about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            About
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
              >
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="User avatar" className="w-9 h-9 rounded-full border-2 border-indigo-100 dark:border-indigo-900" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <div className="p-1">
                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <Link
                href="/login"
                className="px-3 md:px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 md:px-4 py-2 text-sm font-semibold text-white rounded-lg
                bg-[length:200%_100%] bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500
                bg-left hover:bg-right transition-all duration-500 ease-in-out"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>
      <div className="h-16 w-full shrink-0" aria-hidden="true" />
    </>
  );
}