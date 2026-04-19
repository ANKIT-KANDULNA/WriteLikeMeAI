import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "./SignOutButton";
import { User, Mail, Shield, Key } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-black p-4 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account details and preferences.</p>
        </div>

        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt={session.user.name || "User"} className="w-24 h-24 rounded-full border-4 border-indigo-50 dark:border-indigo-900/30" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-4 border-indigo-50 dark:border-indigo-900/20">
                <User className="w-10 h-10 text-indigo-500" />
              </div>
            )}
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{session.user.name || "Unknown User"}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 dark:text-slate-400 mt-1">
                <Mail className="w-4 h-4" />
                <span>{session.user.email}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Security
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Password Authentication</p>
                <p className="text-sm text-slate-500 mt-1">Change your password if you signed up with email.</p>
              </div>
              <button disabled className="mt-4 sm:mt-0 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 opacity-50 cursor-not-allowed">
                Update
              </button>
            </div>
          </div>

          <div className="pt-10 flex border-t border-slate-100 dark:border-slate-800 mt-8">
            <SignOutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
