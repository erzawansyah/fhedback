import * as React from "react"
import { cn } from "@/utils/shadcn"

const Separator = React.forwardRef<
    React.ElementRef<"div">,
    React.ComponentPropsWithoutRef<"div"> & {
        orientation?: "horizontal" | "vertical"
    }
>(({ className, orientation = "horizontal", ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "shrink-0 bg-black",
            orientation === "horizontal" ? "h-[2px] w-full" : "h-full w-[2px]",
            className
        )}
        {...props}
    />
))
Separator.displayName = "Separator"

export { Separator }
