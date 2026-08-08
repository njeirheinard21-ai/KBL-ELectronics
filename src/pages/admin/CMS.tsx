import { Helmet } from "react-helmet-async";
import { FileText, Clock } from "lucide-react";

export function CMS() {
  return (
    <div className="space-y-8">
      <Helmet>
        <title>Content Management System - Admin KBL Electronics</title>
      </Helmet>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand-primary" />
            Content Management
          </h1>
          <p className="text-fg-muted text-sm mt-1">Manage homepage content blocks, policy pages, and announcements</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" /> Module Coming Soon
        </span>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center min-h-[350px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4 text-brand-primary">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">CMS Module</h2>
        <p className="text-fg-muted max-w-md mx-auto">
          The headless CMS builder for page customization and editorial workflows is currently under development.
        </p>
      </div>
    </div>
  );
}
