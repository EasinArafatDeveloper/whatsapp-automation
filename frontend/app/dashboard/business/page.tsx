'use client';

import BusinessForm from '@/components/BusinessForm';

export default function BusinessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Business Context & AI Setup</h1>
        <p className="text-xs text-slate-600 font-medium mt-1">
          Configure product listings, prices, FAQ, support policy, and AI tone for automated DeepSeek customer replies.
        </p>
      </div>

      <BusinessForm />
    </div>
  );
}
