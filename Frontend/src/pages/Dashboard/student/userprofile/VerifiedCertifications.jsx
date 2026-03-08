import React from "react";
import { Verified, Download } from "lucide-react";
import { useGetMyEnrollmentsQuery } from "../../../../redux/Apis/enrollmentApi";

function VerifiedCertifications() {
  const { data: enrollmentsData, isLoading } = useGetMyEnrollmentsQuery();
  const enrollments = enrollmentsData?.data || [];

  const certificatesData = enrollments
    .filter((item) => Number(item.progressPercent || item.progress || 0) >= 100)
    .map((item, index) => {
      const id = item._id || item.id || `cert-${index}`;
      const courseTitle =
        item.courseId?.title || item.course_id?.title || item.courseTitle || "Course Completion";
      return {
        id,
        title: `${courseTitle} Certificate`,
        certId: `CERT-${String(id).slice(-6).toUpperCase()}`,
      };
    });

  return (
    <section className="bg-white dark:dark-glass rounded-2xl md:rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-white/5 shadow-md dark:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1.5 h-8 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></div>
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Certificates
        </h3>
      </div>
      <div className="space-y-4 md:space-y-5">
        {isLoading && (
          <div className="text-sm text-slate-500 dark:text-slate-400">Loading certificates...</div>
        )}
        {!isLoading && certificatesData.length === 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Complete a course to unlock certificates.
          </div>
        )}
        {certificatesData.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 bg-white dark:bg-premium-gold/10 rounded-xl flex items-center justify-center text-studprimary dark:text-premium-gold shadow-sm group-hover:scale-105 transition-transform border border-slate-200 dark:border-white/5">
              <Verified className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {item.title}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {item.certId}
              </p>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-studprimary dark:group-hover:text-premium-gold transition-colors" />
          </div>
        ))}

        {certificatesData.length > 0 && (
          <button className="w-full py-4 mt-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-studprimary dark:text-premium-gold bg-studprimary/5 dark:bg-premium-gold/10 rounded-2xl hover:bg-studprimary/10 dark:hover:bg-premium-gold/20 transition-all">
            View All Certificates
          </button>
        )}
      </div>
    </section>
  );
}

export default VerifiedCertifications;
