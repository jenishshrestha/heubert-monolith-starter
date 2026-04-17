import { Badge } from "@shared/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/DropdownMenu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@shared/components/ui/Sidebar";
import { useUserStore } from "@shared/stores";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  BoxesIcon,
  ChevronUpIcon,
  DownloadIcon,
  LogOutIcon,
  PackageIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/products", label: "Products", icon: BoxesIcon },
  { to: "/import", label: "Import", icon: UploadIcon },
  { to: "/export", label: "Export", icon: DownloadIcon },
] as const;

export function AppSidebar() {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const location = useLocation();
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/products">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <PackageIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">Product Portal</span>
                  <span className="truncate text-xs text-muted-foreground">Course Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.to)}>
                    <Link to={item.to}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">{user?.name}</span>
                    <span className="flex items-center gap-1.5">
                      <Badge
                        variant={user?.role === "admin" ? "default" : "secondary"}
                        className="h-4 px-1 text-xs"
                      >
                        {user?.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </span>
                  </div>
                  <ChevronUpIcon className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuItem asChild>
                  <button
                    type="button"
                    className="w-full"
                    onClick={async () => {
                      logout();
                      await router.invalidate();
                      await router.navigate({ to: "/login" });
                    }}
                  >
                    <LogOutIcon className="mr-2 size-4" />
                    Sign out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
