import { cn } from "@shared/lib/utils";
import type * as React from "react";

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("py-16 md:py-24", className)} {...props} />;
}

export { Section };
