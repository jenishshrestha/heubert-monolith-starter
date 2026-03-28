import { Separator } from "@shared/components/ui/Separator";
import { CharactersTable } from "./tables/CharactersTable";
import { CountriesTable } from "./tables/CountriesTable";
import { ProductsTable } from "./tables/ProductsTable";
import { RecipesTable } from "./tables/RecipesTable";
import { UsersTable } from "./tables/UsersTable";

export function DemoShowcasePage() {
  return (
    <main className="bg-background min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-12">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">DataTable Showcase</h1>
          <p className="text-muted-foreground text-sm">
            Every data source mode, feature, and pattern — all on one page.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-foreground text-lg font-semibold">
            Characters — Custom Provider (Server-Side Filtering)
          </h2>
          <CharactersTable />
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-foreground text-lg font-semibold">
            Users — Provider Mode (Full Featured)
          </h2>
          <UsersTable />
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-foreground text-lg font-semibold">
            Products — Custom Provider (Dynamic Filter Options)
          </h2>
          <ProductsTable />
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-foreground text-lg font-semibold">Recipes — API Mode (Zero Setup)</h2>
          <RecipesTable />
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-foreground text-lg font-semibold">
            Countries — Client Mode (Static Data)
          </h2>
          <CountriesTable />
        </section>
      </div>
    </main>
  );
}
