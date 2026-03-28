import { Avatar, AvatarFallback, AvatarImage } from "@shared/components/ui/Avatar";
import { Badge } from "@shared/components/ui/Badge";
import type { DataTableColumnDef, RowAction } from "@shared/lib/data-table";
import { DataTableColumnHeader, DataTableRowActions } from "@shared/lib/data-table";
import { CopyIcon, EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import type { User } from "../demo-table.types";

const userRowActions: RowAction<User>[] = [
  {
    label: "View",
    icon: EyeIcon,
    onClick: (user) => alert(`View user: ${user.firstName} ${user.lastName}`),
  },
  {
    label: "Edit",
    icon: PencilIcon,
    onClick: (user) => alert(`Edit user: ${user.id}`),
  },
  {
    label: "Copy email",
    icon: CopyIcon,
    onClick: (user) => void navigator.clipboard.writeText(user.email),
  },
  {
    label: "Delete",
    icon: TrashIcon,
    variant: "destructive",
    onClick: (user) => alert(`Delete user: ${user.id}`),
  },
];

export const userColumns: DataTableColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">{row.getValue("id")}</span>
    ),
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
    meta: { label: "Name" },
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
    cell: ({ row }) => {
      const gender = row.getValue<string>("gender");
      return (
        <Badge variant={gender === "male" ? "default" : "secondary"} className="capitalize">
          {gender}
        </Badge>
      );
    },
    meta: { label: "Gender" },
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
    meta: { label: "University" },
  },
  {
    accessorKey: "birthDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Birth Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>("birthDate"));
      return <span>{date.toLocaleDateString("en-US", { dateStyle: "medium" })}</span>;
    },
    meta: { label: "Birth Date" },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row.original} actions={userRowActions} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
];
