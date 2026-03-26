import React from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetPlatformStatsQuery,
  useGetOrganizationsOverviewQuery,
} from "../../../redux/Apis/superAdminApi";
import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import {
  TrendingUp,
  Megaphone,
  FileDown,
  Users,
  BookOpen,
  DollarSign,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Zap,
  Ticket,
  ExternalLink,
  Globe,
  Building,
} from "lucide-react";
import { breadcrumbPaths } from "../../../utils/breadcrumbs";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  color = "gold",
  subtitle,
}) => {
  const themes = {
    gold: "bg-superadminprimary/10 text-superadminprimary border-superadminprimary/20",
    lavender:
      "bg-lavender-500/10 text-purple-500 border-purple-200/50 dark:border-purple-800/30",
    blue: "bg-blue-500/10 text-blue-500 border-blue-200/50 dark:border-blue-800/30",
    emerald:
      "bg-emerald-500/10 text-emerald-500 border-emerald-200/50 dark:border-emerald-800/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-navy-charcoal/50 rounded-2xl p-6 border ${themes[color] || themes.gold} shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group`}
    >
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-24 h-24" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${themes[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
          >
            <TrendingUp className={`h-3 w-3 ${!trendUp && "rotate-180"}`} />
            {trend}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          {value}
        </h3>
        {subtitle && (
          <p className="text-[10px] text-slate-400 mt-1 font-medium italic">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Custom Growth Chart (User Distribution across Organizations - Line Format)
const GrowthChart = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              borderRadius: "12px",
              border: "none",
              color: "#fff",
              fontSize: "11px",
              padding: "12px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#B48B4D"
            strokeWidth={4}
            dot={{ fill: "#B48B4D", strokeWidth: 2, r: 4, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Total Users"
          />
          <Line
            type="monotone"
            dataKey="teachers"
            stroke="#A855F7"
            strokeWidth={4}
            dot={{ fill: "#A855F7", strokeWidth: 2, r: 4, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Teachers"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Quick Statistics Component
const QuickStatItem = ({
  label,
  value,
  percentage,
  color = "bg-superadminprimary",
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs font-bold">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-slate-900 dark:text-white">{value}</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { data: statsRes, isLoading: statsLoading } =
    useGetPlatformStatsQuery();
  const { data: orgsRes, isLoading: orgsLoading } =
    useGetOrganizationsOverviewQuery({ limit: 6 });

  const stats = statsRes?.data || {};
  const organizations = orgsRes?.data || [];

  // Preparing chart data from real organizations
  const chartData = organizations.map((org) => ({
    name: org.name?.split(" ")[0] || "Org",
    users: org.totalUsers || 0,
    teachers: org.teachers || 0,
    students: org.students || 0,
  }));

  if (statsLoading || orgsLoading) {
    return (
      <SuperAdminLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center min-h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-superadminprimary border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">
              Syncing platform data...
            </p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout
      pageTitle="Main Dashboard"
      breadcrumbItems={breadcrumbPaths.SUPERADMIN_DASHBOARD}
    >
      <div className="space-y-8 pb-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome Back, Admin
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
              Platform status is{" "}
              <span className="text-emerald-500 font-bold">Stable</span>.{" "}
              {stats.users?.total || 0} users enrolled.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              <FileDown className="h-4 w-4" />
              Generate Report
            </button>
            <button
              onClick={() => navigate("/superadmin/announcements")}
              className="flex items-center gap-2 px-5 py-2.5 bg-superadminprimary text-white rounded-xl text-sm font-bold shadow-lg shadow-superadminprimary/20 hover:scale-[1.02] transition-all"
            >
              <Megaphone className="h-4 w-4" />
              Create Announcement
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Platform Users"
            value={stats.users?.total?.toLocaleString() || "0"}
            icon={Users}
            trend="+12%"
            color="gold"
            subtitle="Combined Roles"
          />
          <StatCard
            title="Active Organizations"
            value={stats.organizations?.active || "0"}
            icon={Building}
            trend="+5.2%"
            color="lavender"
            subtitle="Live Ecosystems"
          />
          <StatCard
            title="Live Courses"
            value={stats.courses?.total || "0"}
            icon={BookOpen}
            color="blue"
            subtitle="Catalog Size"
          />
          <StatCard
            title="Growth Rate"
            value="24.5%"
            icon={TrendingUp}
            trend="+1.2%"
            color="emerald"
            subtitle="Monthly Progress"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Distribution Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-premium-surface rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden flex flex-col dark:bg-charcoal">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Users per Organization
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Headcount distribution across top institutions
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-superadminprimary" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">
                    Users
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">
                    Teachers
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[300px]">
              <GrowthChart data={chartData} />
            </div>
          </div>

          {/* Quick Statistics */}
          <div className="bg-white dark:bg-premium-surface rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
              Quick Statistics
            </h3>

            <div className="space-y-6">
              <QuickStatItem
                label="Platform Uptime"
                value="99.99%"
                percentage={99}
                color="bg-emerald-500"
              />
              <QuickStatItem
                label="Daily Active Rate"
                value="78%"
                percentage={78}
                color="bg-superadminprimary"
              />

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-charcoal/50 border border-slate-100 dark:border-slate-700 group hover:border-superadminprimary/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-superadminprimary/10 text-superadminprimary">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">
                        Security Clearance
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        KYC Verifications
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-superadminprimary">
                      12
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-charcoal/50 border border-slate-100 dark:border-slate-700 group hover:border-amber-500/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <Ticket className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">
                        Help Desk
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Unresolved Queries
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-amber-500">5</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button
                  onClick={() => navigate("/superadmin/analytics")}
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-superadminprimary hover:border-superadminprimary/30 transition-all bg-white dark:bg-transparent"
                >
                  Deep Analytics Insight
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Highlights - Dynamic Organizations */}
        <div className="bg-white dark:bg-premium-surface rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Recent Platform Highlights
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Latest institutions joining the EduVerse network
              </p>
            </div>
            <button
              onClick={() => navigate("/superadmin/tenants")}
              className="text-[10px] font-black uppercase tracking-widest text-superadminprimary hover:underline flex items-center gap-1 group"
            >
              All Organizations
              <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-charcoal text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Institution Name</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Users</th>
                  <th className="px-6 py-4">Teachers</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {organizations.slice(0, 5).map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-slate-50 dark:hover:bg-navy-charcoal/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-superadminprimary group-hover:bg-superadminprimary/10 transition-all font-bold">
                          {org.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                            {org.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium select-all">
                            {org.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {org.ownerName}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">
                      {org.totalUsers}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      <span className="px-3 py-1 rounded-full bg-superadminprimary/10 text-superadminprimary text-[10px] font-bold">
                        {org.teachers} Instructors
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${org.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`}
                        />
                        <span
                          className={`text-[11px] font-bold uppercase ${org.status === "active" ? "text-emerald-500" : "text-amber-500"}`}
                        >
                          {org.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Dashboard Info */}
        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-superadminprimary flex items-center justify-center text-white font-black text-lg">
              E
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                EduVerse Dashboard System
              </p>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] font-bold text-slate-400">
                <span className="hover:text-superadminprimary cursor-pointer transition-colors">
                  Documentation
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="hover:text-superadminprimary cursor-pointer transition-colors">
                  Security Policy
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="hover:text-superadminprimary cursor-pointer transition-colors">
                  Help Center
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="hover:text-superadminprimary cursor-pointer transition-colors">
                  System Status
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              v2.4.0-stable | Build 20260224
            </p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
