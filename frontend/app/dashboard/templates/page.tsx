'use client';

import TemplateManager from '@/components/TemplateManager';

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Fallback Keyword Templates</h1>
        <p className="text-xs text-slate-400 mt-1">
          Set up keyword-based fallback replies to handle customer inquiries when AI is disabled or unavailable.
        </p>
      </div>

      <TemplateManager />
    </div>
  );
}
