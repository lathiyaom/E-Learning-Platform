import { Calendar, MessageSquare, CheckCircle2, XCircle, Clock, CalendarX } from "lucide-react";
import { Card } from "../../../../components/Card";

const STATUS_CFG = {
  present: {
    label: "Present",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
    dot: "bg-emerald-500",
    Icon: CheckCircle2,
  },
  absent: {
    label: "Absent",
    cls: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/40",
    dot: "bg-red-500",
    Icon: XCircle,
  },
  late: {
    label: "Late",
    cls: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
    dot: "bg-amber-500",
    Icon: Clock,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.absent;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function AttendanceTable({ records }) {
  if (records.length === 0) {
    return (
      <Card className="bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-2xl p-0 gap-0 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <CalendarX className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">No attendance records found</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">No classes have been recorded for this course yet.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-2xl p-0 gap-0 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Date
                </span>
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Remarks
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {records.map((record, idx) => (
              <tr
                key={record.id || record.date || idx}
                className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
                  {record.date
                    ? new Date(record.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {record.remarks || <span className="text-slate-300 dark:text-slate-600">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default AttendanceTable;
