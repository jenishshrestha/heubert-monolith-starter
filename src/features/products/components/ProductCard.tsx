import { Badge } from "@shared/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@shared/components/ui/Card";
import { Checkbox } from "@shared/components/ui/Checkbox";
import { formatFees, STUDY_LEVEL_LABELS } from "../lib/product-format";
import type { Product } from "../types/product.types";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

export function ProductCard({ product, isSelected, onSelect }: ProductCardProps) {
  return (
    <Card
      data-state={isSelected ? "selected" : undefined}
      className="transition-colors data-[state=selected]:border-primary"
    >
      <CardHeader className="flex-row items-start gap-3 space-y-0 pb-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(!!checked)}
          aria-label={`Select ${product.name}`}
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{product.name}</p>
          <p className="truncate text-xs text-muted-foreground">{product.institution}</p>
        </div>
        <Badge variant={product.status === "active" ? "default" : "outline"} className="capitalize">
          {product.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Country</span>
          <span>{product.country}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Study Area</span>
          <span className="max-w-[60%] truncate text-right">{product.studyArea}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Level</span>
          <Badge variant="secondary">{STUDY_LEVEL_LABELS[product.studyLevel]}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Duration</span>
          <span>{product.duration}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Fees</span>
          <span className="font-medium">{formatFees(product.fees, product.currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
