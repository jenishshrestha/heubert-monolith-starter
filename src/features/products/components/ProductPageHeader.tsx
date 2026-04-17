import { cn } from "@shared/lib/utils";
import type * as React from "react";

/**
 * Compound page header following the Atlas pattern.
 *
 * Usage:
 *   <ProductPageHeader.Root>
 *     <ProductPageHeader.Content>
 *       <ProductPageHeader.Title>Products</ProductPageHeader.Title>
 *       <ProductPageHeader.Description>Manage courses</ProductPageHeader.Description>
 *     </ProductPageHeader.Content>
 *     <ProductPageHeader.Actions>
 *       <Button>Add</Button>
 *     </ProductPageHeader.Actions>
 *   </ProductPageHeader.Root>
 */

function Root({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)} {...props} />
  );
}

function Content({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />;
}

function Title({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn("text-2xl font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

function Description({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function Actions({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

export const ProductPageHeader = {
  Root,
  Content,
  Title,
  Description,
  Actions,
};
