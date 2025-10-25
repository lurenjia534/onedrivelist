"use client";
import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  details?: string;
  actions?: Array<{ href: string; label: string; variant?: "primary" | "secondary" }>;
  className?: string;
};

export default function ErrorState({ title, description, details, actions, className }: Props) {
  return (
    <div className={("mx-auto mt-16 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30" + (className ? ` ${className}` : ""))}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white">!
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-red-800/90 dark:text-red-300/90">{description}</p>
          )}
          {details && (
            <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-md bg-red-100/80 p-3 text-xs text-red-900 dark:bg-red-900/30 dark:text-red-200">{details}</pre>
          )}
          {actions && actions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {actions.map((a) => (
                <Link
                  key={a.href + a.label}
                  href={a.href}
                  className={
                    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm " +
                    (a.variant === "secondary"
                      ? "border border-red-300 text-red-800 hover:bg-red-100 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900/30"
                      : "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600")
                  }
                >
                  {a.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
