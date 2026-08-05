import LoadingSpinner from '@/components/LoadingSpinner';

export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4 bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-xl">
        <LoadingSpinner size="xl" variant="blue" />
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">Loading WpAutoAI...</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
}
