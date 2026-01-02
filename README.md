# 🚀 React Professional Boilerplate (2025) #

This is a robust, scalable frontend boilerplate configured with modern web development best practices. It uses **React**, **TypeScript**, **Vite**, and **Tailwind CSS v4**, ready to connect with an API (Node/MySQL).

## 🛠 Tech Stack ##

- **Core:** React 19+, TypeScript, Vite
- **Styling:** Tailwind CSS v4 (Native engine, no config file), Lucide React (Icons), clsx & tailwind-merge
- **State Management (Server):** TanStack Query (React Query)
- **Routing:** React Router DOM v7
- **Networking:** Axios (Configured instance with Interceptors)
- **Forms:** React Hook Form + Zod (Schema Validation)
- **Code Quality:** ESLint, Prettier (via standard Vite config)

## 📂 Folder Structure (Feature-Based) ##

The project follows a feature-based architecture to ensure maintainability and scalability.

```text
src/
├── assets/              # Static assets (images, fonts, global svgs)
├── components/          # SHARED Components
│   ├── ui/              # Generic UI components (Button, Input, Card)
│   └── layout/          # Application layouts (Sidebar, Header)
├── config/              # Environment variables and global constants
├── features/            # BUSINESS MODULES (The core logic)
│   ├── auth/            # Ex: Login, Register, Forgot Password
│   └── [feature-name]/  # Ex: products, customers (isolated components, hooks, services)
├── hooks/               # Global custom hooks
├── lib/                 # Library configurations (Axios, QueryClient setup)
├── routes/              # Route definitions and Guards (Private Routes)
├── services/            # Global API services
├── types/               # Global TypeScript type definitions
└── utils/               # Pure utility functions
```
<br>

## 🚀 Getting Started ##

Install dependencies:

```
Bash:

npm install
```
Run the development server:


```
Bash:

npm run dev
```

Build for production:


```
Bash:

npm run build
```

<br>

## ⚙️ Key Configurations

**1. Tailwind CSS v4**
This project uses the modern **Tailwind v4**. There is no tailwind.config.js. Configuration is handled directly via native CSS.

- **File**: `src/index.css`

- **Directive**: `@import "tailwindcss"`;

**2. Absolute Imports**
Absolute imports are configured. You should use the `@` alias to import files:

```
TypeScript:

// ✅ Correct

import { Button } from '@/components/ui/Button';

// ❌ Avoid
import { Button } from '../../../components/ui/Button';
```

**3. Axios & API**
The HTTP client is configured in src/lib/axios.ts.

Pre-configured **Interceptors** to inject Authorization Tokens.

Global error handling (e.g., auto-logout on 401).

**Base URL**: Defined via `VITE_API_URL` in `.env`.

**4. React Query**
The `QueryClient` is initialized in `src/main.tsx` with optimized defaults:

- `refetchOnWindowFocus: false` (Prevents reload when switching tabs)

- `retry: 1` (Retries failed requests once before throwing an error)

<br>

## 📝 Suggested Next Steps ##

Create a .env file in the root directory with your API URL:


```
Snippet de código:

VITE_API_URL=http://localhost:3000/api
```
Develop the Base Layout in `src/components/layout`.

Create your first feature in `src/features`.
