import { cn } from "@shared/lib/utils";
import type * as React from "react";

function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("container mx-auto px-6", className)} {...props} />;
}

export { Container };
