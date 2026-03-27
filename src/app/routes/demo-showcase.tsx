import { DemoShowcasePage } from "@features/demo-showcase";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/demo-showcase")({
  component: DemoShowcasePage,
});
