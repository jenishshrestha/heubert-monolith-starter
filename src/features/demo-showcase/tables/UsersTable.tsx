/**
 * Use case: mode:"provider" with per-table REST provider
 * Features: Search, faceted filter, row selection, bulk actions, card view, CSV export, row actions
 */
import { Avatar, AvatarFallback, AvatarImage } from "@shared/components/ui/Avatar";
import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { Card, CardContent, CardHeader } from "@shared/components/ui/Card";
import { Checkbox } from "@shared/components/ui/Checkbox";
import {
  createRestProvider,
  createSelectionColumn,
  DataTableColumnHeader,
  DataTableRowActions,
  DT,
  exportSelectedRows,
  useDataTableContext,
} from "@shared/lib/data-table";
import type { DataTableColumnDef, DataTableConfig } from "@shared/lib/data-table/data-table.types";
import { CopyIcon, DownloadIcon, EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import type { User } from "../demo-showcase.types";

const userActions = [
  {
    label: "View",
    icon: EyeIcon,
    onClick: (u: User) => alert(`View: ${u.firstName} ${u.lastName}`),
  },
  { label: "Edit", icon: PencilIcon, onClick: (u: User) => alert(`Edit: ${u.id}`) },
  {
    label: "Copy email",
    icon: CopyIcon,
    onClick: (u: User) => void navigator.clipboard.writeText(u.email),
  },
  {
    label: "Delete",
    icon: TrashIcon,
    variant: "destructive" as const,
    onClick: (u: User) => alert(`Delete: ${u.id}`),
  },
];

const columns: DataTableColumnDef<User>[] = [
  createSelectionColumn<User>(),
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    meta: { label: "ID" },
    size: 60,
  },
  {
    id: "name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="size-7">
          <AvatarImage src={row.original.image} alt={row.original.firstName} />
          <AvatarFallback className="text-xs">
            {row.original.firstName[0]}
            {row.original.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
          <span className="text-muted-foreground text-xs">{row.original.email}</span>
        </div>
      </div>
    ),
    meta: { label: "Name", filter: { type: "text" as const } },
    enableSorting: false,
  },
  {
    accessorKey: "age",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
    meta: { label: "Age" },
    size: 80,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("gender") === "male" ? "default" : "secondary"}
        className="capitalize"
      >
        {row.getValue<string>("gender")}
      </Badge>
    ),
    meta: {
      label: "Gender",
      filter: {
        type: "select" as const,
        options: [
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
        ],
      },
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    meta: { label: "Phone" },
    enableSorting: false,
  },
  {
    accessorKey: "university",
    header: ({ column }) => <DataTableColumnHeader column={column} title="University" />,
    cell: ({ row }) => <span className="max-w-[200px] truncate">{row.getValue("university")}</span>,
    meta: { label: "University", hiddenByDefault: true, filter: { type: "text" as const } },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row.original} actions={userActions} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
];

function UserCard({
  user,
  isSelected,
  onSelect,
}: {
  user: User;
  isSelected: boolean;
  onSelect: (v: boolean) => void;
}) {
  return (
    <Card
      data-state={isSelected ? "selected" : undefined}
      className="data-[state=selected]:border-primary transition-colors"
    >
      <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(v) => onSelect(!!v)}
          aria-label={`Select ${user.firstName}`}
        />
        <Avatar className="size-9">
          <AvatarImage src={user.image} alt={user.firstName} />
          <AvatarFallback className="text-xs">
            {user.firstName[0]}
            {user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-muted-foreground truncate text-xs">{user.email}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Age</span>
          <span>{user.age}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Gender</span>
          <Badge variant={user.gender === "male" ? "default" : "secondary"} className="capitalize">
            {user.gender}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

const dummyJsonProvider = createRestProvider({
  pagination: { style: "offset", skipParam: "skip", limitParam: "limit" },
  sort: { style: "flat", sortByParam: "sortBy", orderParam: "order" },
  response: { dataPath: "users", totalPath: "total" },
  staticParams: {
    select: "id,firstName,lastName,email,age,gender,phone,birthDate,image,university",
  },
});

const config: DataTableConfig<User> = {
  columns,
  cardRenderer: (user, opts) => <UserCard key={user.id} user={user} {...opts} />,
  dataSource: {
    mode: "provider",
    resource: "https://dummyjson.com/users/search",
    provider: dummyJsonProvider,
    paginationType: "offset",
  },
  toolbar: {
    search: { placeholder: "Search users..." },
    advancedFilter: true,
    columnToggle: true,
  },
  pagination: { defaultPageSize: 10, pageSizeOptions: [5, 10, 20] },
  enableSorting: true,
  enableRowSelection: true,
  syncWithUrl: false,
};

function BulkActions() {
  const { table } = useDataTableContext<User>();
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportSelectedRows(table, { filename: "users-selected" })}
      >
        <DownloadIcon className="size-4" /> Export
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => alert(`Delete ${table.getFilteredSelectedRowModel().rows.length} users`)}
      >
        <TrashIcon className="size-4" /> Delete
      </Button>
    </>
  );
}

export function UsersTable() {
  return (
    <DT.Root config={config} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          <code className="bg-muted rounded px-1 text-xs">mode: "provider"</code> — Per-table REST
          provider, row selection, card view, bulk actions, CSV export
        </p>
        <DT.ViewToggle />
      </div>
      <DT.Toolbar />
      <DT.FilterTags />
      <DT.Content />
      <DT.Pagination />
      <DT.BulkBar>
        <BulkActions />
      </DT.BulkBar>
    </DT.Root>
  );
}
