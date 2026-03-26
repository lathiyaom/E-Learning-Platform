import SuperAdminLayout from "../../../utils/SuperAdminLayout";
import { breadcrumbPaths } from "../../../utils/breadcrumbs";
import { useGetPlatformStatsQuery } from "../../../redux/Apis/superAdminApi";
import {
  TrendingUp,
  Users,
  Building,
  BookOpen,
  AlertCircle,
  Activity,
  BarChart3,
  Globe,
  Zap,
  Shield,
  Clock,
  ArrowUpRight,
  PieChart as PieChartIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white dark:bg-premium-surface-2 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
  >
    <div className={`absolute -right-3 -bottom-3 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 ${colorClass}`}>
      <Icon className="w-16 h-16" />
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass.replace('text-', 'from-').split(' ')[0]}/20 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{title}</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
          {value.toLocaleString()}
        </h3>
        {subtext && (
            <p className={`text-[9px] font-bold uppercase mt-1 tracking-tighter ${colorClass}`}>
                {subtext}
            </p>
        )}
      </div>
    </div>
  </motion.div>
);

const MetricBar = ({ label, value, percentage, color, icon: Icon }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${color.replace('bg-', 'bg-').split(' ')[0]}/10 ${color.replace('bg-', 'text-')}`}>
                    <Icon className="h-3 w-3" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
            </div>
            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {value} <span className="text-slate-400">({percentage}%)</span>
            </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`${color} h-full rounded-full shadow-sm`}
            />
        </div>
    </div>
);

const Analytics = () => {
  const { data, isLoading, isError, error } = useGetPlatformStatsQuery();
  const stats = data?.data || {};

  const calculatePercentage = (value, total) => {
    const v = parseFloat(value) || 0;
    const t = parseFloat(total) || 0;
    if (!t) return 0;
    return parseFloat(((v / t) * 100).toFixed(1));
  };

  const COLORS = ["#B48B4D", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
  const GRADIENTS = [
    { start: "#B48B4D", end: "#8B6B3A" }, // Premium Gold
    { start: "#3B82F6", end: "#2563EB" }, // Power Blue
    { start: "#10B981", end: "#059669" }, // Emerald
  ];

  const tenantDistributionData = [
      { name: 'Active', value: stats.tenants?.active || 0 },
      { name: 'Inactive', value: stats.tenants?.inactive || 0 },
      { name: 'Suspended', value: stats.tenants?.suspended || 0 },
  ].filter(d => d.value >= 0);

  const userDistributionData = [
      { name: 'Pupils', value: stats.users?.students || 0 },
      { name: 'Educators', value: stats.users?.teachers || 0 },
      { name: 'Nodes', value: stats.users?.admins || 0 },
  ].filter(d => d.value >= 0);

  if (isLoading) {
    return (
      <SuperAdminLayout pageTitle="Analytics Probe">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="h-12 w-12 border-4 border-superadminprimary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Filtering Global Manifold Data...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (isError) {
    return (
      <SuperAdminLayout pageTitle="Analytics Protocol Error" breadcrumbItems={breadcrumbPaths.SUPERADMIN_ANALYTICS}>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-2xl backdrop-blur-sm">
          <div className="h-20 w-20 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">System Data Unavailable</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">The platform analytics manifold could not be queried. Protocol trace: {error?.data?.message || "Grid disconnect"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-superadminprimary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-superadminprimary/20"
          >
            FORCE SYNC
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout pageTitle="Platform Intelligence" showSearch={false} breadcrumbItems={breadcrumbPaths.SUPERADMIN_ANALYTICS}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="2" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                 <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">Manifold Analytics</h2>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1 italic">Real-time platform operative metrics</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Scan: Active</span>
            </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="Total Institutions" 
                value={stats.tenants?.total || 0} 
                subtext={`${stats.tenants?.active || 0} Operative Hubs`}
                icon={Building} 
                colorClass="text-blue-500" 
                delay={0.05} 
            />
            <StatCard 
                title="Platform Population" 
                value={stats.users?.total || 0} 
                subtext={`${stats.users?.active || 0} Transmitting Signals`}
                icon={Users} 
                colorClass="text-emerald-500" 
                delay={0.1} 
            />
            <StatCard 
                title="Global Curricula" 
                value={stats.courses?.total || 0} 
                subtext="Educational Matrix"
                icon={BookOpen} 
                colorClass="text-superadminprimary" 
                delay={0.15} 
            />
            <StatCard 
                title="Manifold Avg" 
                value={stats.tenants?.total ? Math.round((stats.users?.total || 0) / stats.tenants.total) : 0} 
                subtext="Operatives per Hub"
                icon={TrendingUp} 
                colorClass="text-purple-500" 
                delay={0.2} 
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            
            {/* Institution Distribution Chart */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="xl:col-span-2 bg-white dark:bg-premium-surface-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col min-h-[450px]"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                         <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shadow-sm">
                            <Building className="h-4 w-4" />
                         </div>
                         <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Institutional Tier Distribution</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center flex-1">
                    <div className="lg:col-span-2 h-full min-h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tenantDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F022" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-2xl">
                                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{payload[0].payload.name}</p>
                                                    <p className="text-lg font-black text-slate-900 dark:text-white">{payload[0].value}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    radius={[8, 8, 0, 0]} 
                                    barSize={40}
                                    style={{ filter: 'url(#shadow)' }}
                                >
                                    {tenantDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-6">
                        <MetricBar 
                            label="Operational" 
                            value={stats.tenants?.active || 0} 
                            percentage={calculatePercentage(stats.tenants?.active, stats.tenants?.total)}
                            color="bg-emerald-500" 
                            icon={Zap}
                        />
                         <MetricBar 
                            label="Dormant" 
                            value={stats.tenants?.inactive || 0} 
                            percentage={calculatePercentage(stats.tenants?.inactive, stats.tenants?.total)}
                            color="bg-amber-500" 
                            icon={Clock}
                        />
                         <MetricBar 
                            label="Suspended" 
                            value={stats.tenants?.suspended || 0} 
                            percentage={calculatePercentage(stats.tenants?.suspended, stats.tenants?.total)}
                            color="bg-rose-500" 
                            icon={Shield}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Population Composition Chart (3D-like Ring) */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="bg-white dark:bg-premium-surface-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col group cursor-default"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                         <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm">
                            <PieChartIcon className="h-4 w-4" />
                         </div>
                         <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Population Matrix</h3>
                    </div>
                </div>

                <div className="h-[250px] w-full mb-6 relative group-hover:scale-105 transition-transform duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            {/* Inner Depth Layer */}
                            <Pie
                                data={userDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={60}
                                dataKey="value"
                                isAnimationActive={false}
                                fill="rgba(0,0,0,0.1)"
                                stroke="none"
                                opacity={0.5}
                            />
                            {/* Primary Ring */}
                            <Pie
                                data={userDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {userDistributionData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={COLORS[(index + 1) % COLORS.length]} 
                                        style={{ filter: 'url(#shadow)' }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-2xl">
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{payload[0].name}</p>
                                                <p className="text-lg font-black text-slate-900 dark:text-white">{payload[0].value}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Global</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{stats.users?.total || 0}</p>
                         </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <MetricBar 
                        label="Pupils" 
                        value={stats.users?.students || 0} 
                        percentage={calculatePercentage(stats.users?.students, stats.users?.total)}
                        color="bg-blue-500" 
                        icon={Users}
                    />
                    <MetricBar 
                        label="Educators" 
                        value={stats.users?.teachers || 0} 
                        percentage={calculatePercentage(stats.users?.teachers, stats.users?.total)}
                        color="bg-emerald-500" 
                        icon={BookOpen}
                    />
                    <MetricBar 
                        label="Nodes" 
                        value={stats.users?.admins || 0} 
                        percentage={calculatePercentage(stats.users?.admins, stats.users?.total)}
                        color="bg-superadminprimary" 
                        icon={Shield}
                    />
                </div>
            </motion.div>

        </div>

        {/* Global Key Metrics Section */}
        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-superadminprimary/10 via-transparent to-blue-500/5" />
            
            <div className="p-10 relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                            <Activity className="h-6 w-6 text-superadminprimary" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deep Protocol Analysis</h4>
                            <p className="text-lg font-black uppercase tracking-tight">System Integrity Pulse</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                        <div className="flex items-baseline gap-2">
                             <span className="text-4xl font-black text-blue-400">{stats.tenants?.superadmins || 0}</span>
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Elevated Tiers</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight pr-6">Quantity of administrative nodes holding global platform clearance levels.</p>
                        <div className="flex items-center gap-2 text-blue-400 group cursor-pointer w-fit">
                             <span className="text-[9px] font-black uppercase tracking-widest">Review Security</span>
                             <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-baseline gap-2">
                             <span className="text-4xl font-black text-emerald-400">{calculatePercentage(stats.users?.active, stats.users?.total)}%</span>
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transmission Rate</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight pr-6">Calculated engagement manifold representing active signals across timeframes.</p>
                        <div className="flex items-center gap-2 text-emerald-400 group cursor-pointer w-fit">
                             <span className="text-[9px] font-black uppercase tracking-widest">Engagement Trace</span>
                             <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                         <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-superadminprimary blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
                            <div className="relative h-24 w-24 rounded-full border-2 border-slate-800 flex flex-col items-center justify-center p-4 bg-slate-900 text-center hover:border-superadminprimary/50 transition-colors">
                                <Zap className="h-6 w-6 text-superadminprimary mb-1 animate-pulse" />
                                <span className="text-[8px] font-black uppercase leading-tight text-slate-400">Manifold Peak Health</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
};

export default Analytics;
