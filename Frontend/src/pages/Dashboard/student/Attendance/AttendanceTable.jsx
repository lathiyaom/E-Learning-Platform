import { Calendar, MessageSquare, CheckCircle2, XCircle, Clock, CalendarX } from "lucide-react";
import { Card } from "../../../../components/Card";
import { motion } from "framer-motion";

const STATUS_CFG = {
  present: {
    label: "Present",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/40 shadow-sm",
    dot: "bg-emerald-500",
    Icon: CheckCircle2,
  },
  absent: {
    label: "Absent",
    cls: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800/40 shadow-sm",
    dot: "bg-red-500",
    Icon: XCircle,
  },
  late: {
    label: "Late",
    cls: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/40 shadow-sm",
    dot: "bg-amber-500",
    Icon: Clock,
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.absent;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold border ${cfg.cls} uppercase tracking-wider`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function AttendanceTable({ records }) {
  if (records.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-[2rem] p-0 gap-0 overflow-hidden shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 gap-6 text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <CalendarX className="w-10 h-10 text-slate-400 dark:text-slate-600" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-slate-900 dark:text-white">No attendance records</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">There are no participation records available for the selected course at this time.</p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="bg-white dark:bg-transparent dark:dark-glass border-slate-100 dark:border-white/10 rounded-[2rem] p-0 gap-0 overflow-hidden shadow-xl dark:shadow-black/20">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm">
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-studprimary dark:text-premium-gold" />
                    Session Date
                  </span>
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                  Status
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-studprimary dark:text-premium-gold" />
                    Instructor Remarks
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {records.map((record, idx) => (
                <motion.tr
                  key={record.id || record.date || idx}
                  variants={itemVariants}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  className="transition-colors duration-150"
                >
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">
                    {record.date
                      ? new Date(record.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {record.remarks || <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}

export default AttendanceTable;
