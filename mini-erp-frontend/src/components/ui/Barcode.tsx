import { cn } from "@/lib/cn";

// Fixed bar-width pattern so the mark is stable across renders — it's
// used as the app's recurring signature (logo, nav, login hero).
const PATTERN = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 3, 1, 2, 4, 1];

export function Barcode({
  className,
  barClassName,
}: {
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("flex items-stretch gap-[2px]", className)} aria-hidden="true">
      {PATTERN.map((width, i) => (
        <span
          key={i}
          className={cn("bg-current", barClassName)}
          style={{ width: `${width}px` }}
        />
      ))}
    </div>
  );
}
