import React from "react";
import { Card } from "../../../../components/Card";

function Shimmer({ className }) {
  return <div className={`rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse ${className}`} />;
}

function CardSkeleton() {
  return (
    <Card className="relative bg-white dark:bg-transparent dark:dark-glass border-slate-200 dark:border-white/10 rounded-2xl p-0 gap-0 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 dark:bg-white/10 animate-pulse rounded-l-2xl" />
      <div className="pl-6 pr-5 pt-5 pb-5 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <Shimmer className="w-11 h-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between gap-4">
              <Shimmer className="h-5 w-1/2" />
              <Shimmer className="h-5 w-20 rounded-full" />
            </div>
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-3/4" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
          <Shimmer className="h-4" />
          <Shimmer className="h-4" />
          <Shimmer className="h-4" />
        </div>
        <div className="flex gap-3">
          <Shimmer className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </Card>
  );
}

function UpcomingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Group header skeleton */}
      <Shimmer className="h-5 w-32" />
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <Shimmer className="h-5 w-28" />
      <div className="space-y-4">
        <CardSkeleton />
      </div>
    </div>
  );
}

export default UpcomingSkeleton;
