import { cn } from "@shared/lib/utils";
import type * as React from "react";

function Flex({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex", className)} {...props} />;
}

export { Flex };
