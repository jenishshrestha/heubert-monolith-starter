export type StudyLevel = "undergraduate" | "postgraduate" | "certificate" | "diploma";
export type ProductStatus = "active" | "disabled";

export interface BranchLocation {
  id: string;
  name: string;
  country: string;
  address?: string;
}

export interface EntryRequirementBandScores {
  reading?: number;
  writing?: number;
  listening?: number;
  speaking?: number;
}

export interface EntryRequirement {
  id: string;
  examName: string;
  overallScore: number;
  minimumBandScores?: EntryRequirementBandScores;
  recognized: boolean;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  institution: string;
  country: string;
  studyArea: string;
  studyLevel: StudyLevel;
  duration: string;
  fees: number;
  currency: string;
  description: string;
  branches: BranchLocation[];
  entryRequirements: EntryRequirement[];
  intakes: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  countries: string[];
  institutions: string[];
  studyAreas: string[];
  studyLevels: StudyLevel[];
}

export interface ProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string[];
  institution?: string[];
  studyArea?: string[];
  studyLevel?: StudyLevel[];
  feeMin?: number;
  feeMax?: number;
  status?: ProductStatus | "all";
  sortBy?: keyof Product;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
