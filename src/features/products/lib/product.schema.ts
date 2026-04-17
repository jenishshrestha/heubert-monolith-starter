import { z } from "zod";

export const STUDY_LEVELS = ["undergraduate", "postgraduate", "certificate", "diploma"] as const;

export const PRODUCT_STATUSES = ["active", "disabled"] as const;

export const CURRENCIES = ["USD", "NZD", "AUD", "GBP"] as const;

export const EXAM_NAMES = [
  "IELTS",
  "TOEFL",
  "PTE",
  "CAE/C1 Advanced",
  "CPE/C2 Proficiency",
  "CAEL",
  "OET",
] as const;

export const INTAKE_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const branchLocationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Branch name is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().optional(),
});

export const entryRequirementSchema = z.object({
  id: z.string(),
  examName: z.enum(EXAM_NAMES),
  overallScore: z.number().min(0, "Score must be ≥ 0"),
  minimumBandScores: z
    .object({
      reading: z.number().optional(),
      writing: z.number().optional(),
      listening: z.number().optional(),
      speaking: z.number().optional(),
    })
    .optional(),
  recognized: z.boolean(),
});

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  institution: z.string().min(1, "Institution is required"),
  country: z.string().min(1, "Country is required"),
  studyArea: z.string().min(1, "Study area is required"),
  studyLevel: z.enum(STUDY_LEVELS),
  duration: z.string().min(1, "Duration is required"),
  fees: z.number().min(0, "Fees must be ≥ 0"),
  currency: z.enum(CURRENCIES),
  description: z.string().min(1, "Description is required"),
  branches: z.array(branchLocationSchema),
  entryRequirements: z.array(entryRequirementSchema),
  intakes: z.array(z.string()),
  status: z.enum(PRODUCT_STATUSES),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function productFormDefaults(): ProductFormValues {
  return {
    name: "",
    code: "",
    institution: "",
    country: "",
    studyArea: "",
    studyLevel: "undergraduate",
    duration: "",
    fees: 0,
    currency: "USD",
    description: "",
    branches: [],
    entryRequirements: [],
    intakes: [],
    status: "active",
  };
}
