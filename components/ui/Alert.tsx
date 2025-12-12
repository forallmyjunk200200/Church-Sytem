import type { ReactNode } from "react";

export function Alert({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "error" | "success";
  title?: string;
  children: ReactNode;
}) {
  const base = "rounded-md border p-3 text-sm";
  const styles =
    variant === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : variant === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-slate-200 bg-slate-50 text-slate-800";

  return (
    <div className={`${base} ${styles}`}>
      {title ? <div className="mb-1 font-medium">{title}</div> : null}
      <div>{children}</div>
    </div>
  );
}
