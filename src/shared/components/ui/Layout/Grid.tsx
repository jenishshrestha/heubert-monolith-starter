import { cn } from "@shared/lib/utils";
import type * as React from "react";

function Grid({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid", className)} {...props} />;
}

export { Grid };
