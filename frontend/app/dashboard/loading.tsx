import { DashboardOverviewSkeleton } from '@/components/SkeletonLoader';

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <DashboardOverviewSkeleton />
    </div>
  );
}
