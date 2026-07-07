import { cn } from "@/lib/cn";

const DELAYS = ["0s", "0.1s", "0.2s", "0.3s", "0.15s"];

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex h-6 items-end gap-[3px]", className)}
    >
      {DELAYS.map((delay, i) => (
        <span
          key={i}
          className="w-1 flex-1 animate-barcode rounded-[1px] bg-brand-500"
          style={{ animationDelay: delay }}
        />
      ))}
    </div>
  );
}
