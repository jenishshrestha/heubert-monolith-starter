import { Avatar, AvatarFallback, AvatarImage } from "@shared/components/ui/Avatar";
import { Badge } from "@shared/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@shared/components/ui/Card";
import { Checkbox } from "@shared/components/ui/Checkbox";
import type { User } from "../demo-table.types";

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

export function UserCard({ user, isSelected, onSelect }: UserCardProps) {
  return (
    <Card
      data-state={isSelected ? "selected" : undefined}
      className="data-[state=selected]:border-primary transition-colors"
    >
      <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(value) => onSelect(!!value)}
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
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">University</span>
          <span className="max-w-[60%] truncate text-right">{user.university}</span>
        </div>
      </CardContent>
    </Card>
  );
}
