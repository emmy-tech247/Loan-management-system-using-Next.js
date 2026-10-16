"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  UserCheck,
  Hash,
  MessageSquare,
  Wallet,
  ArrowDownCircle,
  Landmark,
  ArrowUpCircle,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  Receipt,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  PenTool,
  Megaphone,
  Calculator,
  Building2,
  Database,
  PieChart,
  FolderOpen,
  AlertTriangle,
  Activity,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  FileCode,
  KeyRound,
  LogOut,
  Search,
  ChevronRight,
  Shield,
  Bell,
} from "lucide-react";

import { AdminAction, NotificationCounts } from "@/types/admin";
import { adminActions } from "@/lib/admin-dashboard-data";

// Helper map to dynamically render Lucide icons
const iconMap: Record<string, React.ElementType> = {
  Users,
  UserPlus,
  UserCheck,
  Hash,
  MessageSquare,
  Wallet,
  ArrowDownCircle,
  Landmark,
  ArrowUpCircle,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  Receipt,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  PenTool,
  Megaphone,
  Calculator,
  Building2,
  Database,
  PieChart,
  FolderOpen,
  AlertTriangle,
  Activity,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  FileCode,
  KeyRound,
};

export default function ManagingDirectorDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState<string>("Managing Director");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [badges, setBadges] = useState<NotificationCounts>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch admin session details & notification badge counts
  useEffect(() => {
    // Replace with real session hook/API fetch if needed
    setAdminName("Managing Director");

    const fetchBadges = async () => {
      try {
        const res = await fetch("/api/admin_staff/md/dashboard/badges");
        if (res.ok) {
          const data = await res.json();
          setBadges(data);
        }
      } catch (err) {
        console.error("Failed to load notification counts", err);
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Execute session logout endpoint
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/staff_login/login");
    } catch {
      router.push("/staff_login/login");
    }
  };

  // Filter actions based on search query and category selector
  const filteredActions = adminActions.filter((action) => {
    const matchesCategory =
      selectedCategory === "all" || action.category === selectedCategory;
    const matchesSearch =
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (action.description &&
        action.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getBadgeCount = (notifType?: string) => {
    if (!notifType || !badges) return 0;
    return (badges as Record<string, number>)[notifType] || 0;
  };

  const totalPendingNotifications = Object.values(badges).reduce(
    (acc, curr) => acc + (curr || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans -mt-28 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/staff_login/login" className="flex items-center gap-2">
                <Image
                  src="/images/logo2.png"
                  alt="DCG Cooperative Logo"
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
                <Shield className="h-3 w-3 text-emerald-400" /> Executive Portal
              </span>
            </div>

            {/* Logout Action */}
            <div className="flex items-center gap-3">
              {totalPendingNotifications > 0 && (
                <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                  <Bell className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                  {totalPendingNotifications} Actionable Items
                </div>
              )}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 mt-2 lg:px-8  space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2 max-w-2xl">
            <span className="inline-block rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
              Managing Director Executive Suite
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {adminName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Manage members, execute financial approvals, inspect system logs, and supervise society operations from your control center.
            </p>
          </div>
        </div>

        {/* Controls Bar: Search & Category Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl text-xs font-semibold text-slate-600">
            {[
              { id: "all", label: "All Actions" },
              { id: "management", label: "Members & Staff" },
              { id: "approvals", label: "Approvals" },
              { id: "financials", label: "Financial Ops" },
              { id: "logs_reports", label: "Logs & Reports" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-2 rounded-xl transition-all ${
                  selectedCategory === tab.id
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dashboard tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Actions Grid */}
        {filteredActions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredActions.map((action) => {
              const IconComponent = iconMap[action.iconName] || FileText;
              const badgeCount = getBadgeCount(action.notifType);

              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Notification Badge */}
                      {badgeCount > 0 && (
                        <span className="inline-flex items-center rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-extrabold text-white shadow-xs">
                          {badgeCount}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {action.title}
                      </h3>
                      {action.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {action.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-xs font-semibold text-slate-400 group-hover:text-emerald-600 transition-colors pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-0.5">
                      Open Action <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No actions found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No dashboard actions matching &quot;{searchQuery}&quot; were found. Try modifying your search query or switching categories.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DCG Multipurpose Cooperative Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
