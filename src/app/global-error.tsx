'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f9ff] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-[#c4c6cd] mb-4 block">error</span>
          <h1 className="font-serif text-3xl text-[#1d2832] mb-3">Something went wrong</h1>
          <p className="text-[#43474c] mb-8">
            We hit an unexpected error. This has been logged and we&apos;re looking into it.
          </p>
          <button
            onClick={reset}
            className="bg-[#006c4d] text-white px-8 py-3 rounded font-manrope uppercase tracking-widest text-xs hover:opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </body>
    </html>
  );
}
