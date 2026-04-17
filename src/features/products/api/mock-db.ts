import type {
  FilterOptions,
  PaginatedResponse,
  Product,
  ProductStatus,
  ProductsParams,
} from "../types/product.types";

const NETWORK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS));
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ─── Seed data ───────────────────────────────────────────────────────────────
// PRD-compliant products across multiple institutions, levels, countries.
// Entry requirements include PRD-specific rules:
//   • Massey University: CAEL + OET entries marked recognized=false
//   • Undergraduate BBus: CAE/C1 Advanced → 169 overall, 162 per skill
//   • Postgraduate: CPE/C2 Proficiency → 176
// -----------------------------------------------------------------------------

const NOW = "2025-01-15T10:00:00.000Z";

const SEED_PRODUCTS: Product[] = [
  // ── Massey University (NZ) ──
  {
    id: "prod_mba_massey",
    name: "Master of Business Administration",
    code: "MBA-2024",
    institution: "Massey University",
    country: "New Zealand",
    studyArea: "Business & Management",
    studyLevel: "postgraduate",
    duration: "2 years",
    fees: 38000,
    currency: "NZD",
    description: "A comprehensive MBA program preparing leaders for global business challenges.",
    branches: [
      { id: "br_mu_auckland", name: "Auckland", country: "New Zealand" },
      { id: "br_mu_wellington", name: "Wellington", country: "New Zealand" },
    ],
    entryRequirements: [
      {
        id: "er_mba_ielts",
        examName: "IELTS",
        overallScore: 6.5,
        minimumBandScores: { reading: 6, writing: 6, listening: 6, speaking: 6 },
        recognized: true,
      },
      {
        id: "er_mba_toefl",
        examName: "TOEFL",
        overallScore: 90,
        recognized: true,
      },
      {
        id: "er_mba_cpe",
        examName: "CPE/C2 Proficiency",
        overallScore: 176,
        minimumBandScores: { reading: 162, writing: 162, listening: 162, speaking: 162 },
        recognized: true,
      },
      // PRD rule: Massey doesn't recognise CAEL or OET
      { id: "er_mba_cael", examName: "CAEL", overallScore: 60, recognized: false },
      { id: "er_mba_oet", examName: "OET", overallScore: 350, recognized: false },
    ],
    intakes: ["February", "July"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_bbus_massey",
    name: "Bachelor of Business",
    code: "BBUS-2024",
    institution: "Massey University",
    country: "New Zealand",
    studyArea: "Business & Management",
    studyLevel: "undergraduate",
    duration: "3 years",
    fees: 28500,
    currency: "NZD",
    description: "Foundation business degree with majors in Finance, Marketing, and Management.",
    branches: [
      { id: "br_mu_auckland", name: "Auckland", country: "New Zealand" },
      { id: "br_mu_palmerston", name: "Palmerston North", country: "New Zealand" },
    ],
    entryRequirements: [
      {
        id: "er_bbus_ielts",
        examName: "IELTS",
        overallScore: 6.0,
        minimumBandScores: { reading: 5.5, writing: 5.5, listening: 5.5, speaking: 5.5 },
        recognized: true,
      },
      // PRD rule: BBus (undergraduate) CAE/C1 Advanced = 169 overall, 162 per skill
      {
        id: "er_bbus_cae",
        examName: "CAE/C1 Advanced",
        overallScore: 169,
        minimumBandScores: { reading: 162, writing: 162, listening: 162, speaking: 162 },
        recognized: true,
      },
      { id: "er_bbus_cael", examName: "CAEL", overallScore: 55, recognized: false },
      { id: "er_bbus_oet", examName: "OET", overallScore: 300, recognized: false },
    ],
    intakes: ["February", "July"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_bsc_massey",
    name: "Bachelor of Science",
    code: "BSC-2024",
    institution: "Massey University",
    country: "New Zealand",
    studyArea: "Sciences",
    studyLevel: "undergraduate",
    duration: "3 years",
    fees: 32000,
    currency: "NZD",
    description: "Broad-based science degree with majors in biology, chemistry, physics.",
    branches: [{ id: "br_mu_auckland", name: "Auckland", country: "New Zealand" }],
    entryRequirements: [
      {
        id: "er_bsc_ielts",
        examName: "IELTS",
        overallScore: 6.0,
        minimumBandScores: { reading: 5.5, writing: 5.5, listening: 5.5, speaking: 5.5 },
        recognized: true,
      },
      { id: "er_bsc_cael", examName: "CAEL", overallScore: 55, recognized: false },
      { id: "er_bsc_oet", examName: "OET", overallScore: 300, recognized: false },
    ],
    intakes: ["February", "July"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── University of Sydney (AU) ──
  {
    id: "prod_bsc_eng_sydney",
    name: "Bachelor of Science (Engineering)",
    code: "BSC-ENG-2024",
    institution: "University of Sydney",
    country: "Australia",
    studyArea: "Engineering",
    studyLevel: "undergraduate",
    duration: "4 years",
    fees: 49000,
    currency: "AUD",
    description: "Engineering fundamentals with specialisations in mechanical, civil, electrical.",
    branches: [{ id: "br_sydney_main", name: "Sydney", country: "Australia" }],
    entryRequirements: [
      {
        id: "er_bsceng_ielts",
        examName: "IELTS",
        overallScore: 6.5,
        minimumBandScores: { reading: 6, writing: 6, listening: 6, speaking: 6 },
        recognized: true,
      },
      { id: "er_bsceng_toefl", examName: "TOEFL", overallScore: 85, recognized: true },
      { id: "er_bsceng_pte", examName: "PTE", overallScore: 58, recognized: true },
    ],
    intakes: ["February", "July"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_mit_sydney",
    name: "Master of Information Technology",
    code: "MIT-2024",
    institution: "University of Sydney",
    country: "Australia",
    studyArea: "Information Technology",
    studyLevel: "postgraduate",
    duration: "2 years",
    fees: 52000,
    currency: "AUD",
    description: "Advanced IT with tracks in AI, cybersecurity, data science.",
    branches: [
      { id: "br_sydney_main", name: "Sydney", country: "Australia" },
      { id: "br_sydney_melbourne", name: "Melbourne", country: "Australia" },
    ],
    entryRequirements: [
      {
        id: "er_mit_ielts",
        examName: "IELTS",
        overallScore: 6.5,
        minimumBandScores: { reading: 6, writing: 6, listening: 6, speaking: 6 },
        recognized: true,
      },
      {
        id: "er_mit_cpe",
        examName: "CPE/C2 Proficiency",
        overallScore: 176,
        recognized: true,
      },
    ],
    intakes: ["February", "July", "November"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── Kathmandu University (NP) ──
  {
    id: "prod_bba_finance_ku",
    name: "BBA in Finance",
    code: "BBA-FIN-2024",
    institution: "Kathmandu University",
    country: "Nepal",
    studyArea: "Business & Management",
    studyLevel: "undergraduate",
    duration: "4 years",
    fees: 6500,
    currency: "USD",
    description: "Finance-focused business administration degree.",
    branches: [{ id: "br_ku_dhulikhel", name: "Dhulikhel", country: "Nepal" }],
    entryRequirements: [
      {
        id: "er_bbafin_ielts",
        examName: "IELTS",
        overallScore: 6.0,
        recognized: true,
      },
    ],
    intakes: ["August"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_bsc_eng_ku",
    name: "B.Sc. Engineering",
    code: "BSC-ENG-KU-2024",
    institution: "Kathmandu University",
    country: "Nepal",
    studyArea: "Engineering",
    studyLevel: "undergraduate",
    duration: "4 years",
    fees: 7500,
    currency: "USD",
    description: "Engineering program with civil, mechanical, and computer tracks.",
    branches: [{ id: "br_ku_dhulikhel", name: "Dhulikhel", country: "Nepal" }],
    entryRequirements: [
      {
        id: "er_bsceng_ku_ielts",
        examName: "IELTS",
        overallScore: 6.0,
        recognized: true,
      },
    ],
    intakes: ["August"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── TAFE Australia — Certificates ──
  {
    id: "prod_cert3_electrical",
    name: "Certificate III in Electrical Engineering",
    code: "CERT3-ELEC-2024",
    institution: "TAFE NSW",
    country: "Australia",
    studyArea: "Trades",
    studyLevel: "certificate",
    duration: "1 year",
    fees: 12000,
    currency: "AUD",
    description: "Trade-ready certificate for electrical apprentices.",
    branches: [
      { id: "br_tafe_sydney", name: "Sydney", country: "Australia" },
      { id: "br_tafe_newcastle", name: "Newcastle", country: "Australia" },
    ],
    entryRequirements: [
      { id: "er_c3e_ielts", examName: "IELTS", overallScore: 5.5, recognized: true },
    ],
    intakes: ["February", "July"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_cert4_plumbing",
    name: "Certificate IV in Plumbing",
    code: "CERT4-PLM-2024",
    institution: "TAFE NSW",
    country: "Australia",
    studyArea: "Trades",
    studyLevel: "certificate",
    duration: "18 months",
    fees: 14000,
    currency: "AUD",
    description: "Advanced plumbing certification.",
    branches: [{ id: "br_tafe_sydney", name: "Sydney", country: "Australia" }],
    entryRequirements: [
      { id: "er_c4p_ielts", examName: "IELTS", overallScore: 5.5, recognized: true },
    ],
    intakes: ["February", "July"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_diploma_nursing",
    name: "Diploma of Nursing",
    code: "DIP-NURS-2024",
    institution: "TAFE NSW",
    country: "Australia",
    studyArea: "Health Sciences",
    studyLevel: "diploma",
    duration: "2 years",
    fees: 22000,
    currency: "AUD",
    description: "Pathway to becoming an enrolled nurse.",
    branches: [
      { id: "br_tafe_sydney", name: "Sydney", country: "Australia" },
      { id: "br_tafe_melbourne", name: "Melbourne", country: "Australia" },
    ],
    entryRequirements: [
      { id: "er_dipn_ielts", examName: "IELTS", overallScore: 6.5, recognized: true },
      { id: "er_dipn_oet", examName: "OET", overallScore: 350, recognized: true },
    ],
    intakes: ["February", "July"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── University of Auckland (NZ) ──
  {
    id: "prod_bcom_auckland",
    name: "Bachelor of Commerce",
    code: "BCOM-2024",
    institution: "University of Auckland",
    country: "New Zealand",
    studyArea: "Business & Management",
    studyLevel: "undergraduate",
    duration: "3 years",
    fees: 34000,
    currency: "NZD",
    description: "Commerce degree with majors in accounting, finance, economics.",
    branches: [{ id: "br_uoa_main", name: "Auckland", country: "New Zealand" }],
    entryRequirements: [
      { id: "er_bcom_ielts", examName: "IELTS", overallScore: 6.0, recognized: true },
    ],
    intakes: ["March", "July"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_mph_auckland",
    name: "Master of Public Health",
    code: "MPH-2024",
    institution: "University of Auckland",
    country: "New Zealand",
    studyArea: "Health Sciences",
    studyLevel: "postgraduate",
    duration: "18 months",
    fees: 45000,
    currency: "NZD",
    description: "Advanced public health education with research focus.",
    branches: [{ id: "br_uoa_main", name: "Auckland", country: "New Zealand" }],
    entryRequirements: [
      { id: "er_mph_ielts", examName: "IELTS", overallScore: 6.5, recognized: true },
      {
        id: "er_mph_cpe",
        examName: "CPE/C2 Proficiency",
        overallScore: 176,
        recognized: true,
      },
    ],
    intakes: ["March"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── University of Melbourne (AU) ──
  {
    id: "prod_jd_melbourne",
    name: "Juris Doctor",
    code: "JD-2024",
    institution: "University of Melbourne",
    country: "Australia",
    studyArea: "Law",
    studyLevel: "postgraduate",
    duration: "3 years",
    fees: 58000,
    currency: "AUD",
    description: "Graduate law degree for non-law undergraduates.",
    branches: [{ id: "br_unimelb_parkville", name: "Parkville", country: "Australia" }],
    entryRequirements: [
      {
        id: "er_jd_ielts",
        examName: "IELTS",
        overallScore: 7.0,
        minimumBandScores: { reading: 7, writing: 7, listening: 7, speaking: 7 },
        recognized: true,
      },
    ],
    intakes: ["February"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_barts_melbourne",
    name: "Bachelor of Arts",
    code: "BARTS-2024",
    institution: "University of Melbourne",
    country: "Australia",
    studyArea: "Arts & Humanities",
    studyLevel: "undergraduate",
    duration: "3 years",
    fees: 41000,
    currency: "AUD",
    description: "Liberal arts foundation with 40+ major options.",
    branches: [{ id: "br_unimelb_parkville", name: "Parkville", country: "Australia" }],
    entryRequirements: [
      { id: "er_barts_ielts", examName: "IELTS", overallScore: 6.5, recognized: true },
    ],
    intakes: ["February", "July"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── Monash University (AU) ──
  {
    id: "prod_bpharm_monash",
    name: "Bachelor of Pharmacy",
    code: "BPHARM-2024",
    institution: "Monash University",
    country: "Australia",
    studyArea: "Health Sciences",
    studyLevel: "undergraduate",
    duration: "4 years",
    fees: 47000,
    currency: "AUD",
    description: "Accredited pharmacy degree preparing for registration.",
    branches: [{ id: "br_monash_clayton", name: "Clayton", country: "Australia" }],
    entryRequirements: [
      {
        id: "er_bpharm_ielts",
        examName: "IELTS",
        overallScore: 7.0,
        minimumBandScores: { reading: 6.5, writing: 6.5, listening: 6.5, speaking: 6.5 },
        recognized: true,
      },
    ],
    intakes: ["February"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── University of Toronto (CA) ──
  {
    id: "prod_bcs_toronto",
    name: "Bachelor of Computer Science",
    code: "BCS-2024",
    institution: "University of Toronto",
    country: "Canada",
    studyArea: "Information Technology",
    studyLevel: "undergraduate",
    duration: "4 years",
    fees: 58000,
    currency: "USD",
    description: "Rigorous CS program with co-op options.",
    branches: [
      { id: "br_uoft_stgeorge", name: "St George", country: "Canada" },
      { id: "br_uoft_mississauga", name: "Mississauga", country: "Canada" },
    ],
    entryRequirements: [
      { id: "er_bcs_ielts", examName: "IELTS", overallScore: 6.5, recognized: true },
      { id: "er_bcs_toefl", examName: "TOEFL", overallScore: 100, recognized: true },
    ],
    intakes: ["September"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_mds_toronto",
    name: "Master of Data Science",
    code: "MDS-2024",
    institution: "University of Toronto",
    country: "Canada",
    studyArea: "Information Technology",
    studyLevel: "postgraduate",
    duration: "16 months",
    fees: 72000,
    currency: "USD",
    description: "Applied data science master's with industry capstone.",
    branches: [{ id: "br_uoft_stgeorge", name: "St George", country: "Canada" }],
    entryRequirements: [
      { id: "er_mds_ielts", examName: "IELTS", overallScore: 7.0, recognized: true },
      {
        id: "er_mds_cpe",
        examName: "CPE/C2 Proficiency",
        overallScore: 176,
        recognized: true,
      },
    ],
    intakes: ["September"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── University of Edinburgh (UK) ──
  {
    id: "prod_mba_edinburgh",
    name: "Master of Business Administration",
    code: "EMBA-2024",
    institution: "University of Edinburgh",
    country: "United Kingdom",
    studyArea: "Business & Management",
    studyLevel: "postgraduate",
    duration: "1 year",
    fees: 38000,
    currency: "GBP",
    description: "One-year intensive MBA with European focus.",
    branches: [{ id: "br_uoe_main", name: "Edinburgh", country: "United Kingdom" }],
    entryRequirements: [
      { id: "er_emba_ielts", examName: "IELTS", overallScore: 7.0, recognized: true },
    ],
    intakes: ["September"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_bsc_ai_edinburgh",
    name: "Bachelor of Science in Artificial Intelligence",
    code: "BSC-AI-2024",
    institution: "University of Edinburgh",
    country: "United Kingdom",
    studyArea: "Information Technology",
    studyLevel: "undergraduate",
    duration: "4 years",
    fees: 32000,
    currency: "GBP",
    description: "AI-focused computing degree.",
    branches: [{ id: "br_uoe_main", name: "Edinburgh", country: "United Kingdom" }],
    entryRequirements: [
      { id: "er_bscai_ielts", examName: "IELTS", overallScore: 6.5, recognized: true },
    ],
    intakes: ["September"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── University of Otago (NZ) ──
  {
    id: "prod_bhs_otago",
    name: "Bachelor of Health Sciences",
    code: "BHS-2024",
    institution: "University of Otago",
    country: "New Zealand",
    studyArea: "Health Sciences",
    studyLevel: "undergraduate",
    duration: "3 years",
    fees: 30000,
    currency: "NZD",
    description: "Pre-professional pathway to medicine, dentistry, pharmacy.",
    branches: [{ id: "br_otago_dunedin", name: "Dunedin", country: "New Zealand" }],
    entryRequirements: [
      { id: "er_bhs_ielts", examName: "IELTS", overallScore: 6.0, recognized: true },
    ],
    intakes: ["February"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prod_medlab_otago",
    name: "Bachelor of Medical Laboratory Science",
    code: "BMLS-2024",
    institution: "University of Otago",
    country: "New Zealand",
    studyArea: "Health Sciences",
    studyLevel: "undergraduate",
    duration: "4 years",
    fees: 35000,
    currency: "NZD",
    description: "Registered medical laboratory scientist pathway.",
    branches: [{ id: "br_otago_dunedin", name: "Dunedin", country: "New Zealand" }],
    entryRequirements: [
      { id: "er_bmls_ielts", examName: "IELTS", overallScore: 6.5, recognized: true },
    ],
    intakes: ["February"],
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── Disabled examples ──
  {
    id: "prod_legacy_cert",
    name: "Certificate III in Hospitality (Legacy)",
    code: "LEGACY-HOSP-2020",
    institution: "TAFE NSW",
    country: "Australia",
    studyArea: "Hospitality",
    studyLevel: "certificate",
    duration: "6 months",
    fees: 8000,
    currency: "AUD",
    description: "Legacy program, no longer accepting new enrolments.",
    branches: [{ id: "br_tafe_sydney", name: "Sydney", country: "Australia" }],
    entryRequirements: [
      { id: "er_lhosp_ielts", examName: "IELTS", overallScore: 5.0, recognized: true },
    ],
    intakes: [],
    status: "disabled",
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2023-06-01T00:00:00.000Z",
  },
];

// ─── Mutable store ───────────────────────────────────────────────────────────

let store: Product[] = [...SEED_PRODUCTS];

// ─── Query helpers ───────────────────────────────────────────────────────────

function matchesSearch(p: Product, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(needle) ||
    p.code.toLowerCase().includes(needle) ||
    p.institution.toLowerCase().includes(needle) ||
    p.description.toLowerCase().includes(needle)
  );
}

function matchesFilters(p: Product, params: ProductsParams): boolean {
  if (params.country?.length && !params.country.includes(p.country)) {
    return false;
  }
  if (params.institution?.length && !params.institution.includes(p.institution)) {
    return false;
  }
  if (params.studyArea?.length && !params.studyArea.includes(p.studyArea)) {
    return false;
  }
  if (params.studyLevel?.length && !params.studyLevel.includes(p.studyLevel)) {
    return false;
  }
  if (params.feeMin != null && p.fees < params.feeMin) {
    return false;
  }
  if (params.feeMax != null && p.fees > params.feeMax) {
    return false;
  }
  if (params.status && params.status !== "all" && p.status !== params.status) {
    return false;
  }
  return true;
}

function sortProducts(products: Product[], sortBy?: keyof Product, order: "asc" | "desc" = "desc") {
  if (!sortBy) {
    return products;
  }
  return [...products].sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];
    if (av == null || bv == null) {
      return 0;
    }
    if (av < bv) {
      return order === "asc" ? -1 : 1;
    }
    if (av > bv) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  });
}

// ─── Public API (mirrors future real backend) ────────────────────────────────

export function getProducts(params: ProductsParams = {}): Promise<PaginatedResponse<Product>> {
  const { page = 1, limit = 10, search, sortBy = "createdAt", order = "desc" } = params;
  const searchTerm = search?.trim();

  // Single pass: combined filter + search (per js-combine-iterations)
  const matched = store.filter(
    (p) => matchesFilters(p, params) && (!searchTerm || matchesSearch(p, searchTerm)),
  );

  const filtered = sortProducts(matched, sortBy, order);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return delay({
    data,
    pagination: { page, limit, total, totalPages },
  });
}

export function getProduct(id: string): Promise<Product> {
  const product = store.find((p) => p.id === id);
  if (!product) {
    return Promise.reject(new Error(`Product not found: ${id}`));
  }
  return delay(product);
}

export function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<Product> {
  const product: Product = {
    ...data,
    id: `prod_${uid()}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store = [product, ...store];
  return delay(product);
}

export function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const idx = store.findIndex((p) => p.id === id);
  if (idx < 0) {
    return Promise.reject(new Error(`Product not found: ${id}`));
  }
  const existing = store[idx];
  if (!existing) {
    return Promise.reject(new Error(`Product not found: ${id}`));
  }
  const updated: Product = {
    ...existing,
    ...data,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: nowIso(),
  };
  store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
  return delay(updated);
}

export function toggleProductStatus(id: string, status: ProductStatus): Promise<Product> {
  return updateProduct(id, { status });
}

export function deleteProduct(id: string): Promise<void> {
  store = store.filter((p) => p.id !== id);
  return delay(undefined);
}

export function bulkDeleteProducts(ids: string[]): Promise<{ deleted: number }> {
  const before = store.length;
  store = store.filter((p) => !ids.includes(p.id));
  return delay({ deleted: before - store.length });
}

export function getFilterOptions(): Promise<FilterOptions> {
  const countries = [...new Set(store.map((p) => p.country))].sort();
  const institutions = [...new Set(store.map((p) => p.institution))].sort();
  const studyAreas = [...new Set(store.map((p) => p.studyArea))].sort();
  const studyLevels: FilterOptions["studyLevels"] = [
    "undergraduate",
    "postgraduate",
    "certificate",
    "diploma",
  ];
  return delay({ countries, institutions, studyAreas, studyLevels });
}
