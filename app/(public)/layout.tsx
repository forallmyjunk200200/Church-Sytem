export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-4 py-10">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
