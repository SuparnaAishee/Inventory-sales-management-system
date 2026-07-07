import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-brand-gradient font-display font-extrabold text-white shadow-md shadow-brand-600/30",
        className
      )}
      aria-hidden="true"
    >
      M
    </div>
  );
}
