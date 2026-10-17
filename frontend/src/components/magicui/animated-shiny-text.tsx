import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FC,
} from "react"
import { cn } from "@/lib/utils"

export interface AnimatedShinyTextProps
  extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 120,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "animate-shiny-text",
        "bg-[length:250%_100%]",
        "bg-clip-text bg-no-repeat",
        "bg-gradient-to-r",
        "from-transparent via-white via-50% to-transparent",
        "text-foreground",

        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
