import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "shimmer",
  ...props
}: React.ComponentProps<"div"> & { variant?: "shimmer" | "pulse" }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md",
        variant === "shimmer"
          ? "skeleton-shimmer animate-shimmer"
          : "animate-pulse bg-accent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
