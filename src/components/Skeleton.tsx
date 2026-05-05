export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#c4c6cd]/20 rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-[#c4c6cd]/20 p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 px-4">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="material-symbols-outlined text-[#c4c6cd] text-5xl mb-4">{icon}</span>
      <h3 className="font-medium text-[#1d2832] text-lg mb-2">{title}</h3>
      {description && <p className="text-sm text-[#43474c] max-w-md mb-6">{description}</p>}
      {action && (
        <a
          href={action.href}
          className="bg-[#006c4d] text-white px-6 py-2.5 rounded font-manrope uppercase tracking-widest text-xs hover:opacity-90 transition-all"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
