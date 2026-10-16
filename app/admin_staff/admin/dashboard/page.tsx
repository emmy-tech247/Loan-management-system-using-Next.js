"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle2,
  BarChart3,
  Megaphone,
  Database,
  Landmark,
  Wallet,
  FileCheck,
  ArrowDownCircle,
  RefreshCw,
  PenTool,
  MessageSquare,
  ArrowUpCircle,
  Receipt,
  LogOut,
  Search,
  ChevronRight,
  Shield,
  Bell,
  FileText,
  FolderOpen,
} from "lucide-react";

type AdminAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  category: string;
};

const adminActions: AdminAction[] = [
  {
    id: "members",
    title: "Manage Members",
    description: "View, manage and administer cooperative members.",
    href: "/admin_staff/admin/manage-members",
    icon: Users,
    category: "management",
  },
  {
    id: "deposits",
    title: "Acknowledge Deposits",
    description: "Review and acknowledge member deposit transactions.",
    href: "/admin_staff/admin/acknowledge-deposits",
    icon: CheckCircle2,
    category: "approvals",
  },
  {
    id: "reports",
    title: "View Reports",
    description: "Review financial and operational reports.",
    href: "/admin_staff/admin/view-reports",
    icon: BarChart3,
    category: "logs_reports",
  },
  {
    id: "announcements",
    title: "Create Announcement",
    description: "Create and publish announcements to members.",
    href: "/admin_staff/admin/announcements",
    icon: Megaphone,
    category: "management",
  },
  {
    id: "backup",
    title: "Backup & Recovery",
    description: "Manage database backups and system recovery.",
    href: "/admin_staff/admin/backup-recovery",
    icon: Database,
    category: "logs_reports",
  },
  {
    id: "fixed-deposits",
    title: "Acknowledge Fixed Deposits",
    description: "Review and acknowledge fixed deposit requests.",
    href: "/admin_staff/admin/acknowledge-fd",
    icon: Landmark,
    category: "approvals",
  },
  {
    id: "topups",
    title: "Acknowledge Top-up Requests",
    description: "Review and process member top-up requests.",
    href: "/admin_staff/admin/acknowledge-topups",
    icon: Wallet,
    category: "approvals",
  },
  {
    id: "documents",
    title: "View & Acknowledge Documents",
    description: "Review submitted member documents.",
    href: "/admin_staff/admin/documents",
    icon: FileCheck,
    category: "approvals",
  },
  {
    id: "withdrawals",
    title: "Acknowledge Withdrawal",
    description: "Review and process withdrawal requests.",
    href: "/admin_staff/admin/acknowledge-withdrawals",
    icon: ArrowDownCircle,
    category: "approvals",
  },
  {
    id: "repayment",
    title: "Acknowledge Repayment",
    description: "Review and acknowledge loan repayment transactions.",
    href: "/admin_staff/admin/acknowledge-repayment",
    icon: RefreshCw,
    category: "financials",
  },
  {
    id: "signatures",
    title: "View & Acknowledge Signatures",
    description: "Review pending signatures and approvals.",
    href: "/admin_staff/admin/view-signatures",
    icon: PenTool,
    category: "approvals",
  },
  {
    id: "chat",
    title: "Chat with Member",
    description: "Communicate directly with cooperative members.",
    href: "/admin_staff/admin/chat",
    icon: MessageSquare,
    category: "management",
  },
  {
    id: "fd-withdrawal",
    title: "FD Withdrawal / Rollover",
    description: "Manage fixed deposit withdrawals and rollovers.",
    href: "/admin_staff/admin/fd-withdrawals",
    icon: ArrowUpCircle,
    category: "financials",
  },
  {
    id: "transactions",
    title: "View All Financial Transactions",
    description: "View deposits, withdrawals, repayments and other transactions.",
    href: "/admin_staff/admin/transactions",
    icon: Receipt,
    category: "financials",
  },
  {
    id: "loan-report",
    title: "Loan Report & Repayment",
    description: "Monitor loan defaults and repayment activities.",
    href: "/admin_staff/admin/loan-report",
    icon: FileText,
    category: "logs_reports",
  },
];

export default function Admin1Dashboard() {
  const router = useRouter();

  const [adminName, setAdminName] = useState("Admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});

  /*
   * Fetch the logged-in Admin 1 details.
   *
   * Replace this endpoint with your actual Next.js session endpoint.
   */
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await fetch("/api/admin_staff/admin/session");

        if (response.ok) {
          const data = await response.json();

          if (data?.full_name) {
            setAdminName(data.full_name);
          }
        }
      } catch (error) {
        console.error("Failed to load admin session:", error);
      }
    };

    const fetchBadges = async () => {
      try {
        const response = await fetch("/api/admin_staff/admin/badges");

        if (response.ok) {
          const data = await response.json();
          setBadges(data);
        }
      } catch (error) {
        console.error("Failed to load notification badges:", error);
      }
    };

    fetchAdmin();
    fetchBadges();

    const interval = setInterval(fetchBadges, 15000);

    return () => clearInterval(interval);
  }, []);

  /*
   * Logout
   *
   * Your old PHP version used:
   * session_destroy()
   *
   * In Next.js, this should be handled by your API/auth system.
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/staff");
    }
  };

  const filteredActions = adminActions.filter((action) => {
    const matchesCategory =
      selectedCategory === "all" ||
      action.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !query ||
      action.title.toLowerCase().includes(query) ||
      action.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const totalPendingNotifications = Object.values(badges).reduce(
    (total, value) => total + (value || 0),
    0
  );

  const getBadgeCount = (id: string) => {
    return badges[id] || 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans -mt-28 flex flex-col">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin_staff/admin/dashboard"
              className="flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-extrabold text-slate-900">
                  DCG Cooperative
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Admin Portal
                </p>
              </div>
            </Link>

            <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white md:inline-flex">
              <Shield className="h-3 w-3 text-emerald-400" />
              Admin 1
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {totalPendingNotifications > 0 && (
              <div className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 md:flex">
                <Bell className="h-3.5 w-3.5 text-amber-600" />

                {totalPendingNotifications} Pending
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="
                inline-flex items-center gap-2
                rounded-xl
                border border-slate-200
                bg-white
                px-3.5 py-2
                text-xs font-bold text-slate-700
                transition-all
                hover:border-rose-200
                hover:bg-rose-50
                hover:text-rose-600
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <LogOut className="h-4 w-4" />

              <span>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 mt-2 sm:px-6 lg:px-8">

        {/* =======================================================
            WELCOME BANNER
        ======================================================= */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md sm:p-8">

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Shield className="h-3.5 w-3.5" />
              Administration Control Center
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome, {adminName}
            </h1>

            <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              Select an action below to manage members, approve financial
              activities, review documents, monitor transactions and supervise
              cooperative operations.
            </p>
          </div>
        </section>

        {/* =======================================================
            SEARCH + CATEGORY
        ======================================================= */}
        <section className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-200/60 p-1 text-xs font-semibold text-slate-600">

            {[
              {
                id: "all",
                label: "All Actions",
              },
              {
                id: "management",
                label: "Members & Staff",
              },
              {
                id: "approvals",
                label: "Approvals",
              },
              {
                id: "financials",
                label: "Financial Ops",
              },
              {
                id: "logs_reports",
                label: "Logs & Reports",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`
                  rounded-xl px-3 py-2 transition-all
                  ${
                    selectedCategory === tab.id
                      ? "bg-white font-bold text-slate-900 shadow-sm"
                      : "hover:bg-white/60 hover:text-slate-900"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search dashboard tasks..."
              className="
                w-full rounded-2xl
                border border-slate-200
                bg-white
                py-2.5 pl-10 pr-4
                text-xs text-slate-900
                placeholder:text-slate-400
                shadow-sm
                outline-none
                transition-all
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-500/20
              "
            />
          </div>
        </section>

        {/* =======================================================
            ACTIONS
        ======================================================= */}
        {filteredActions.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {filteredActions.map((action) => {
              const Icon = action.icon;
              const badge = getBadgeCount(action.id);

              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className="
                    group relative flex min-h-[190px]
                    flex-col justify-between
                    rounded-2xl
                    border border-slate-200/90
                    bg-white
                    p-5
                    shadow-sm
                    transition-all
                    hover:-translate-y-0.5
                    hover:border-emerald-200
                    hover:shadow-md
                  "
                >
                  <div className="space-y-4">

                    {/* Icon + badge */}
                    <div className="flex items-center justify-between">

                      <div
                        className="
                          flex h-11 w-11
                          items-center justify-center
                          rounded-xl
                          bg-slate-100
                          text-slate-700
                          transition-colors
                          group-hover:bg-emerald-600
                          group-hover:text-white
                        "
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {badge > 0 && (
                        <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
                          {badge}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                        {action.title}
                      </h2>

                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Admin Action
                    </span>

                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-400 transition-colors group-hover:text-emerald-600">
                      Open
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          /* Empty state */
          <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No actions found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              No dashboard actions matching &quot;
              {searchQuery}
              &quot; were found. Try another search or category.
            </p>
          </section>
        )}
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DCG Multipurpose Cooperative
            Society Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}