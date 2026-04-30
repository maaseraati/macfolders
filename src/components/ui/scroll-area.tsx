import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("scrollbar-thin overflow-y-auto", className)}
      {...props}
    >
      {children}
    </div>
  )
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
