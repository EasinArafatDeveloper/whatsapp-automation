'use client';

import BusinessForm from '@/components/BusinessForm';

export default function BusinessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Business Context & AI Setup</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure product listings, prices, FAQ, support policy, and AI tone for automated DeepSeek customer replies.
        </p>
      </div>

      <BusinessForm />
    </div>
  );
}
