# Heubert

**The React + AI Stack for 2026** — A feature-driven starter for building modern web applications.

![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)
![Bun](https://img.shields.io/badge/bun-%3E%3D1-orange.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Stack

| Category      | Tools                                                               |
| ------------- | ------------------------------------------------------------------- |
| **Core**      | React 19 &middot; Vite 8 &middot; TypeScript 5.9                    |
| **Styling**   | Tailwind CSS 4 &middot; shadcn/ui (53 components) &middot; Radix UI |
| **Routing**   | TanStack Router (file-based)                                        |
| **Data**      | TanStack Query &middot; Axios                                       |
| **State**     | Zustand                                                             |
| **Forms**     | React Hook Form &middot; Zod                                        |
| **Animation** | Motion                                                              |
| **AI**        | Vercel AI SDK                                                       |
| **Testing**   | Vitest &middot; Testing Library &middot; Playwright                 |
| **DX**        | Biome &middot; Storybook 10 (46 stories) &middot; Husky             |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/jenishshrestha/heubert-monolith.git
cd heubert-monolith

# 2. Install
bun install

# 3. Environment
cp .env.example .env

# 4. AI Skills (optional — for Claude Code users)
./setup-ai-skills.sh

# 5. Dev server → http://localhost:5173
bun run dev

# 6. Storybook → http://localhost:6006
bun run storybook
```

### Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [Bun](https://bun.sh/) >= 1

## Scripts

| Command                   | Description                    |
| ------------------------- | ------------------------------ |
| `bun run dev`             | Start dev server (port 5173)   |
| `bun run build`           | Type-check + production build  |
| `bun run preview`         | Preview production build       |
| `bun run type-check`      | TypeScript type checking       |
| `bun run lint`            | Lint with Biome                |
| `bun run format`          | Format with Biome              |
| `bun run test`            | Run unit tests (Vitest)        |
| `bun run test:ui`         | Run tests with Vitest UI       |
| `bun run test:e2e`        | Run E2E tests (Playwright)     |
| `bun run storybook`       | Start Storybook (port 6006)    |
| `bun run build-storybook` | Build Storybook for deployment |

## Project Structure

```
src/
├── app/                        # App entry + routing
│   ├── main.tsx                # Entry point (ErrorBoundary + RouterProvider)
│   ├── routeTree.gen.ts        # Auto-generated route tree
│   └── routes/
│       ├── __root.tsx          # Root layout (QueryClientProvider + devtools)
│       └── index.tsx           # Home route
│
├── features/                   # Feature modules (business capabilities)
│   └── home/
│       ├── HomePage.tsx
│       ├── components/
│       │   ├── TechStack.tsx
│       │   ├── TechLogo.tsx
│       │   └── logos/          # 22 SVG logo components
│       └── index.ts            # Public API
│
├── shared/                     # Shared infrastructure
│   ├── components/
│   │   ├── ui/                 # 53 shadcn/ui components + 46 co-located stories
│   │   │   ├── button.tsx
│   │   │   ├── button.stories.tsx
│   │   │   └── ...
│   │   └── providers/
│   │       └── theme.tsx       # ThemeProvider (next-themes)
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── utils.ts            # cn(), capitalize(), handleError()
│   │   ├── config.ts           # App config (env vars)
│   │   ├── fonts.ts            # Geist font setup
│   │   ├── api/
│   │   │   └── client.ts       # Axios client with interceptors
│   │   └── query/
│   │       └── client.ts       # React Query config + query keys
│   ├── stores/
│   │   ├── theme-store.ts      # Zustand theme persistence
│   │   └── user-store.ts       # Zustand user state
│   ├── types/
│   │   └── index.ts            # User, ApiResponse, PaginatedResponse (Zod)
│   └── test/
│       └── setup.ts            # Vitest setup
│
├── global.css                   # Tailwind + OKLch design tokens
└── vite-env.d.ts               # Env type declarations
```

## Architecture

This project follows **Feature-Driven Development (FDD)** — code is organized by business capability, not technical type.

### Three layers

| Layer        | Path            | Purpose                            |
| ------------ | --------------- | ---------------------------------- |
| **app**      | `src/app/`      | Entry point, routing, root layout  |
| **features** | `src/features/` | Self-contained business modules    |
| **shared**   | `src/shared/`   | Infrastructure used by 3+ features |

### Path aliases

| Alias        | Resolves to     |
| ------------ | --------------- |
| `@/`         | `src/`          |
| `@shared/`   | `src/shared/`   |
| `@features/` | `src/features/` |
| `@app/`      | `src/app/`      |

### Import rules

```tsx
// Within a feature → use RELATIVE imports
import { useAuth } from "../hooks/use-auth";

// Between features → import from PUBLIC API (index.ts)
import { LoginForm } from "@features/auth";

// Shared infrastructure → use @shared alias
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
```

## Creating a New Feature

```
src/features/contacts/
├── components/
│   ├── contacts-list.tsx
│   ├── contacts-list.stories.tsx   ← co-located story
│   └── contact-card.tsx
├── hooks/
│   └── use-contacts.ts
├── types/
│   └── contact.ts
├── contacts-page.tsx
├── contacts.test.tsx               ← co-located test
└── index.ts                        ← public API
```

**index.ts** — Only export what other features need:

```tsx
export { ContactsPage } from "./contacts-page";
export { useContacts } from "./hooks/use-contacts";
export type { Contact } from "./types/contact";
```

**Route** — Add a route file:

```tsx
// src/app/routes/contacts.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ContactsPage } from "@features/contacts";

export const Route = createFileRoute("/contacts")({
  component: ContactsPage,
});
```

## Working with UI Components

### Using existing components

```tsx
import { Button } from "@shared/components/ui/button";
import { Card, CardHeader, CardContent } from "@shared/components/ui/card";
import { Input } from "@shared/components/ui/input";

function MyForm() {
  return (
    <Card>
      <CardHeader>
        <h2>My Form</h2>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Adding new shadcn/ui components

```bash
bunx shadcn@latest add [component-name]
```

Components are installed to `src/shared/components/ui/` via [components.json](components.json).

## Data Fetching

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@shared/lib/api/client";
import { queryKeys } from "@shared/lib/query/client";

function ContactsList() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => apiRequest("get", "/contacts"),
  });

  const mutation = useMutation({
    mutationFn: (contact) => apiRequest("post", "/contacts", contact),
  });

  return <div>{/* ... */}</div>;
}
```

## State Management

```tsx
import { create } from "zustand";

interface CounterStore {
  count: number;
  increment: () => void;
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## Testing

```bash
bun run test              # Unit tests (Vitest)
bun run test:ui           # Vitest with browser UI
bun run test:e2e          # E2E tests (Playwright)
bun run test:e2e:ui       # Playwright with browser UI
```

Co-locate test files with the code they verify:

```
src/features/auth/
├── hooks/
│   ├── use-auth.ts
│   └── use-auth.test.ts    ← next to the hook
├── auth.test.tsx            ← feature-level test
└── index.ts
```

## Storybook

Stories are **co-located** next to their components (not in a separate folder):

```
src/shared/components/ui/
├── button.tsx
├── button.stories.tsx      ← right here
├── dialog.tsx
├── dialog.stories.tsx
└── ...
```

46 pre-built stories are included covering: Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, Context Menu, Dialog, Drawer, Dropdown Menu, Form, Hover Card, Input, Input OTP, Label, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toggle, Toggle Group, Tooltip, and more.

## AI Skills

This project includes AI agent skills for Claude Code:

```bash
./setup-ai-skills.sh          # Install all skills
./setup-ai-skills.sh --force  # Reinstall
```

**Installed skills:**

- `code-review` — Pull request code review
- `FDD-architecture` — Feature-driven architecture standards
- `tailwind-v4-best-practices` — Tailwind CSS v4 patterns
- `vercel-composition-patterns` — React composition patterns
- `vercel-react-best-practices` — React best practices

## Git Guardrails

Husky enforces quality gates on every commit and push:

| Hook           | What it does                                                                 |
| -------------- | ---------------------------------------------------------------------------- |
| **pre-commit** | Runs `lint-staged` — Biome lint + format on staged files only                |
| **commit-msg** | Enforces [Conventional Commits](https://www.conventionalcommits.org/) format |
| **pre-push**   | Runs `type-check` + `build` — catches errors before they hit CI              |

### Commit message format

```
<type>(scope?): <description>

Types: feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert

Examples:
  feat: add contacts feature
  fix(auth): resolve token refresh race condition
  refactor(shared): extract form validation hook
```

## Environment Variables

```bash
# API
VITE_API_URL=http://localhost:3000

# AI (Vercel AI SDK)
VITE_OPENAI_API_KEY=your_key_here

# Feature Flags
VITE_ENABLE_AI=true
VITE_ENABLE_ANALYTICS=false
```

## License

MIT

---

Built with [React](https://react.dev/) &middot; [Vite](https://vite.dev/) &middot; [TanStack](https://tanstack.com/) &middot; [Tailwind CSS](https://tailwindcss.com/) &middot; [shadcn/ui](https://ui.shadcn.com/) &middot; [Vercel AI SDK](https://sdk.vercel.ai/)
