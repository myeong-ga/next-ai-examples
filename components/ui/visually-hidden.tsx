import { cn } from "@/lib/utils"
import type { HTMLAttributes } from "react"

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {}

const VisuallyHidden = ({ className, ...props }: VisuallyHiddenProps) => {
  return <span className={cn("sr-only", className)} {...props} />
}

export { VisuallyHidden }
