import { Helmet } from "react-helmet-async";
import { BarChart2, Clock } from "lucide-react";

export function Reporting() {
  return (
    <div className="space-y-8">
      <Helmet>
        <title>Advanced Analytics & Reporting - Admin KBL Electronics</title>
      </Helmet>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <BarChart2 className="h-8 w-8 text-brand-primary" />
            Analytics & Reports
          </h1>
          <p className="text-fg-muted text-sm mt-1">Export sales CSVs, revenue projections, and cohort analysis</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" /> Module Coming Soon
        </span>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center min-h-[350px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4 text-brand-primary">
          <BarChart2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Advanced Reporting Engine</h2>
        <p className="text-fg-muted max-w-md mx-auto">
          Detailed sales reporting and automated export scheduling will be added in the next release update.
        </p>
      </div>
    </div>
  );
}
