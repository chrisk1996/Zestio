export default function TourLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="h-16 bg-white border-b border-slate-100" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-24">
        <div className="h-8 bg-slate-100 rounded w-64 mb-6" />
        <div className="h-4 bg-slate-100 rounded w-96 mb-10" />
        <div className="h-[300px] bg-slate-100 rounded-xl mb-10" />
        <div className="h-6 bg-slate-100 rounded w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-100 rounded-xl overflow-hidden">
              <div className="aspect-video" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
