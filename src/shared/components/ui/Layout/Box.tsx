import { cn } from "@shared/lib/utils";
import type * as React from "react";

function Box({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(className)} {...props} />;
}

export { Box };
