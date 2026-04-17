```md id="datamik_context_v2"
# Datamik Project Context

---

## 🧠 Overview

Datamik is a structured company data platform where users can:

- Add companies
- Browse company data
- View detailed company profiles
- Claim ownership of company profiles via domain verification
- Edit company data if they are the verified owner

The product focuses on:
- Simplicity
- Structured data
- Ownership & trust
- Minimal UI

---

## 🎯 Product Goals

- Build a clean, reliable company database
- Enable verified ownership via domain-based claims
- Prevent spam and unauthorized edits
- Keep UI minimal, fast, and readable
- Scale into a structured data platform (Crunchbase-lite)

---

## 🧱 Tech Stack

- Frontend: Next.js (App Router)
- Styling: Tailwind CSS
- Backend: Supabase (Postgres + Auth + RLS)
- Auth:
  - Google OAuth
  - Email Magic Link (OTP)
- Deployment: Vercel
- Version Control: GitHub

---

## 📁 Project Structure

```

datamik/
app/
page.tsx                  → Homepage
companies/
page.tsx                → Companies listing
[id]/
page.tsx              → Company detail
edit/
page.tsx            → Edit company (owner only)
add-company/
page.tsx                → Add company form
lib/
supabase.ts               → Supabase client
public/
logos, favicon, assets
datamik-context.md

```

---

## 🔐 Authentication

Using Supabase Auth.

Supported methods:
- Google OAuth (fast login)
- Email Magic Link (universal login)

User object is used for:
- `created_by`
- `claimed_by`

---

## 🗄️ Database (Supabase)

### Main Table: `companies`

### Fields:

- `id` (uuid, primary key)
- `name` (text, required)
- `domain` (text, unique, required)
- `alias` (text[])
- `short_description` (text)
- `description` (text)

### Location:
- `city`
- `country`

### Classification:
- `industry`
- `categories` (text[])

### Company Info:
- `founded_date`
- `company_type`
- `employee_count_range`

### Links:
- `website_url`
- `linkedin_url`

### Ownership:
- `created_by` (uuid)
- `claimed_by` (uuid)
- `claim_status` (unclaimed | pending | claimed)

### Meta:
- `is_verified`
- `datamik_score`
- `profile_views`
- `created_at`
- `updated_at`

---

## 🔐 Security (RLS)

Row Level Security is ENABLED.

Policies:

- Public can SELECT companies
- Authenticated users can INSERT companies
- Only owner (`claimed_by`) can UPDATE company
- Claim allowed only if:
  - user is logged in
  - company is unclaimed

---

## 🔁 Core Data Flow

User → Add Company → Supabase → Companies Table  
User → View Companies → Fetch → UI  
User → Claim Company → Domain Match → Update claimed_by  
Owner → Edit Company → Update DB  

---

## 🚀 Features Built

### ✅ Authentication
- Google login
- Email login (magic link)

### ✅ Company Creation
- Add Company form
- Domain normalization
- Validation

### ✅ Companies Listing
- Fetch from Supabase
- Clean UI cards
- Loading + empty states

### ✅ Company Detail Page
- Fetch single company
- Structured UI
- Clickable domain

### ✅ Claim Company
- Domain-based eligibility
- Claim button
- Claimed state handling

---

## 🧪 Known Working Functionality

- Login (Google + Email)
- Add company
- View companies list
- View company detail
- Claim company (domain match)

---

## ⚠️ Constraints / Rules

- Keep UI minimal (black & white)
- Avoid unnecessary libraries
- Do not over-engineer early
- Maintain clean folder structure
- Prefer simple logic over abstraction

---

## 📌 Current Features In Progress

### 🔄 Ownership UI
- Show "Claimed" badge
- Show "You own this company"
- Show Edit button for owner

### 🔄 Edit Company
- Owner-only access
- Pre-filled form
- Update company data

---

## 🧠 Claim Logic

- Extract domain from user email
- Normalize company domain
- Compare both
- If match → allow claim

Example:
user: john@stripe.com  
company: stripe.com → match → claim allowed

---

## 🧠 Coding Guidelines

- Write minimal, readable code
- Use client components only when needed
- Keep Supabase queries simple
- Avoid deeply nested logic
- Handle loading/error states properly

---

## 🎨 UI Principles

- Black & white theme
- Clean spacing
- Subtle borders
- Minimal interactions
- No heavy animations

---

## 🔮 Future Roadmap (DO NOT BUILD YET)

### Data & Discovery
- Search companies
- Filters (industry, country)
- Sorting

### Trust & Ownership
- Domain verification (email confirmation)
- Admin moderation
- Verified badge

### Product Expansion
- Company dashboards
- User profiles
- External data enrichment (APIs)

---

## 📣 Instructions for AI (Cursor)

- Always read this file before coding
- Do not break existing working features
- Keep UI consistent
- Follow schema strictly
- Avoid unnecessary complexity
- Explain plan before major code generation
```

---

# 🧠 What changed (important)

You now have:

* Claim system documented ✅
* Auth methods updated ✅
* Real project structure ✅
* Future roadmap clarified ✅

---