
```md
# Datamik Project Context

---

## 🧠 Overview

Datamik is a structured company data platform where users can:

- Add companies
- Browse company data
- Claim ownership of company profiles
- View structured, clean, and verified company information

The product focuses on:
- Simplicity
- Data clarity
- Minimal UI
- Structured datasets

---

## 🎯 Product Goals (Important)

- Build a clean, reliable company database
- Avoid cluttered directory-style UX
- Ensure high-quality structured data
- Enable ownership via domain-based claiming
- Keep UI minimal and fast

---

## 🧱 Tech Stack

- Frontend: Next.js (App Router)
- Styling: Tailwind CSS
- Backend: Supabase (Postgres + Auth)
- Auth: Google OAuth via Supabase
- Deployment: Vercel
- Version Control: GitHub

---

## 📁 Project Structure

```

datamik/
app/
page.tsx                → Homepage
layout.tsx              → Root layout (font, metadata)
lib/
supabase.ts             → Supabase client
public/
datamik-context.md        → Project context
package.json

```

---

## 🔐 Authentication

- Supabase Auth is used
- Google login is implemented
- Session is handled client-side using `supabase.auth.getUser()`

User object is used for:
- `created_by`
- `claimed_by`

---

## 🗄️ Database (Supabase)

### Main Table: `companies`

### Key Fields:

- `id` (uuid, primary key)
- `name` (text, required)
- `domain` (text, unique, required)
- `alias` (text[])
- `short_description` (text)
- `description` (text)

### Location:
- `city` (text)
- `country` (text)

### Classification:
- `industry` (text)
- `categories` (text[])

### Company Info:
- `founded_date` (date)
- `company_type` (text)
- `employee_count_range` (text)

### Links:
- `website_url` (text)
- `linkedin_url` (text)

### People:
- `founders` (text[])

### Tech:
- `tech_stack` (text[])

### Ownership:
- `created_by` (uuid → auth.users.id)
- `claimed_by` (uuid → auth.users.id)
- `claim_status` (text: unclaimed | pending | claimed)

### Meta:
- `is_verified` (boolean)
- `datamik_score` (integer)
- `profile_views` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## 🔐 Security (RLS)

Row Level Security is ENABLED.

Policies:

- Public can SELECT companies
- Authenticated users can INSERT
- Only creator or claimed owner can UPDATE
- Only creator or claimed owner can DELETE

---

## 🔗 Supabase Client

Located at:

```

/lib/supabase.ts

````

Used via:

```ts
import { supabase } from '../lib/supabase'
````

---

## 🎨 UI / Design System

### Design Principles:

* Black & white only
* No heavy colors
* Minimal components
* Clean spacing
* Focus on readability

### Typography:

* JetBrains Mono (via next/font)

### Components style:

* Rounded corners (lg/xl)
* Subtle borders
* Hover states (invert colors)
* No shadows unless necessary

---

## 🧭 Routing (Next.js App Router)

Current:

* `/` → Homepage

Planned:

* `/companies` → List all companies
* `/companies/[id]` → Company detail page
* `/add-company` → Add company form

---

## ⚙️ Environment Variables

Used in:

```
.env.local (local)
Vercel → Environment Variables (production)
```

Required:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 🚀 Features Built

* Supabase project setup
* Companies table created
* RLS policies applied
* Supabase client configured
* Google authentication working
* Homepage UI built (minimal black & white)
* Vercel deployment working
* Domain connected
* Google Search Console connected

---

## 🧪 Known Working Functionality

* Login with Google
* Supabase connection successful
* Data can be inserted and fetched manually
* Deployment pipeline works (GitHub → Vercel)

---

## ⚠️ Constraints / Rules

* Do NOT overcomplicate UI
* Do NOT introduce heavy UI libraries
* Do NOT restructure project unnecessarily
* Always maintain clean folder structure
* Avoid breaking existing functionality

---

## 📌 Current Tasks (Priority Order)

1. Build Add Company Form
2. Build Companies Listing Page
3. Build Company Detail Page
4. Implement Claim Company flow
5. Add search + filters

---

## 🧠 Coding Guidelines (VERY IMPORTANT)

* Always write minimal, readable code
* Avoid unnecessary abstractions
* Prefer simple React state over complex patterns
* Use client components only when needed
* Keep Supabase queries clean and direct

---

## 🔁 Data Flow (Important)

User → Form → Supabase Insert → Database → Fetch → UI Render

---

## 🧩 Future Enhancements (Do NOT build yet)

* Full people graph (founders, employees)
* Advanced ranking algorithm
* External data imports
* AI enrichment

---

## 📣 Instructions for AI (Cursor / Assistant)

* Always read this file before making changes
* Do not assume missing fields — refer to schema
* Do not rewrite existing working logic unnecessarily
* Keep UI consistent with homepage
* Explain plan before generating large code changes