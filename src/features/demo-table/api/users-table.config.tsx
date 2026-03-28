import type { DataTableConfig } from "@shared/lib/data-table";
import { createSelectionColumn } from "@shared/lib/data-table";
import { UserCard } from "../components/UserCard";
import type { User } from "../demo-table.types";
import { userColumns } from "../lib/columns";

export const usersTableConfig: DataTableConfig<User> = {
  columns: [createSelectionColumn<User>(), ...userColumns],
  cardRenderer: (user, { isSelected, onSelect }) => (
    <UserCard key={user.id} user={user} isSelected={isSelected} onSelect={onSelect} />
  ),
  dataSource: {
    mode: "api",
    resource: "https://dummyjson.com/users/search",
    pagination: { style: "offset", skipParam: "skip", limitParam: "limit" },
    sort: { style: "flat", sortByParam: "sortBy", orderParam: "order" },
    searchParam: "q",
    staticParams: {
      select: "id,firstName,lastName,email,age,gender,phone,birthDate,image,university",
    },
    response: {
      dataPath: "users",
      totalPath: "total",
    },
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 30, 50],
  },
  enableSorting: true,
  enableRowSelection: true,
  syncWithUrl: true,
};
