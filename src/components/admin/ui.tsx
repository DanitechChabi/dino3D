export function AdminTitle({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-4xl font-semibold text-night-900">{title}</h1>
        {text && <p className="mt-1 text-night-800/70">{text}</p>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-night-900/10 bg-white p-5 sm:p-6 ${className}`}>{children}</div>;
}
