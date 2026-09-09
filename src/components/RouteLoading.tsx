import { SkeletonCard } from "@/components/SkeletonCard";

export function RouteLoading({ label, minHeight }: { label: string; minHeight: number }) {
  return (
    <div className="screen-pad" role="status" aria-label={`Loading ${label}`} aria-busy="true" style={{ minHeight }}>
      <SkeletonCard />
    </div>
  );
}
