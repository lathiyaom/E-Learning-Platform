import { Card } from "../../../../components/Card";

function Shimmer({ className }) {
  return <div className={`rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse ${className}`} />;
}

function AttendanceSkeleton() {
  return (
    <Card className="bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-2xl p-0 gap-0 overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
          <Shimmer className="h-4 w-[30%]" />
          <Shimmer className="h-4 w-[20%]" />
          <Shimmer className="h-4 w-[40%]" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            <Shimmer className="h-4 w-[30%]" />
            <Shimmer className="h-6 w-[20%] rounded-full" />
            <Shimmer className="h-4 w-[40%]" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default AttendanceSkeleton;
