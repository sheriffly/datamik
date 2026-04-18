```md id="datamik_context_v3"
# Datamik Project Context

---

## 🧠 Overview

Datamik is a structured company data platform where users can:

- Add companies
- Browse company data
- View detailed company profiles
- Claim ownership of company profiles via domain verification
- Edit company data if they are the verified owner
- Create and manage public user profiles
- View public user profiles and their claimed companies

The product focuses on:
- Simplicity
- Structured data
- Ownership & trust
- Clean, minimal UI

---

## 🎯 Product Goals

- Build a clean, reliable company database
- Enable verified ownership via domain-based claims
- Establish user identity and credibility
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
profile/
page.tsx                → Edit own profile
u/
[username]/
page.tsx              → Public profile (SSR)
loading.tsx           → Loading state
lib/
supabase.ts               → Client-side Supabase
profile.ts                → Username + URL helpers
public/
logos, favicon, assets
datamik-context.md

```

---

## 🔐 Authentication

Using Supabase Auth.

Supported methods:
- Google OAuth
- Email Magic Link (OTP)

User object is used for:
- `created_by`
- `claimed_by`

Admin role:
- Stored in `user.user_metadata.role`
- Possible values:
  - 'user'
  - 'admin'

(Currently admin is NOT used in core logic)

---

## 🗄️ Database (Supabase)

### 1. `companies`

Core table for company data.

Key fields:
- `id` (uuid)
- `name`
- `domain`
- `industry`
- `description`

Ownership:
- `created_by`
- `claimed_by`
- `claim_status` ('unclaimed' | 'claimed')

Meta:
- `created_at`
- `updated_at`

---

### 2. `profiles`

User identity layer.

Fields:
- `id` (uuid, references auth.users)
- `username` (unique, lowercase)
- `name`
- `bio`
- `avatar_url`
- `website_url`
- `social_links` (jsonb)
- `created_at`
- `updated_at`

Constraints:
- Username regex: `^[a-z0-9_]{3,30}$`
- Unique index on `lower(username)`

---

### 3. `company_edit_logs`

Audit log for edits.

Fields:
- `id`
- `company_id`
- `edited_by`
- `previous_data` (jsonb)
- `new_data` (jsonb)
- `edited_at`

---

## 🔐 Security (RLS)

Row Level Security is ENABLED.

### Companies
- Public can SELECT
- Authenticated users can INSERT
- Only owner (`claimed_by`) can UPDATE
- Claim allowed only if:
  - user is logged in
  - company is unclaimed

### Profiles
- Public can SELECT
- Users can INSERT their own profile
- Users can UPDATE their own profile

### Edit Logs
- Authenticated users can INSERT logs
- Logs are tied to `edited_by`

---

## 🔁 Core Data Flow

User → Add Company → Supabase → Companies Table  
User → View Companies → Fetch → UI  
User → Claim Company → Domain Match → Update claimed_by  
Owner → Edit Company → Update DB + Log changes  
User → Create Profile → Profiles Table  
Public → View Profile → Fetch profile + claimed companies  

---

## 🚀 Features Built

### ✅ Authentication
- Google login
- Email login (magic link)

### ✅ Company System
- Add Company form
- Companies listing
- Company detail page

### ✅ Claim System
- Domain-based eligibility
- Claim button
- Claimed state handling

### ✅ Ownership UI
- "Claimed" badge
- Owner detection
- Edit button (owner only)

### ✅ Edit Company
- Owner-only access
- Pre-filled form
- Update company data
- Audit logging

### ✅ Profiles System
- Create/edit profile
- Username validation
- Website normalization
- Avatar fallback

### ✅ Public Profile Page
- Route: `/u/[username]`
- Server-side rendering (SSR)
- SEO metadata
- Claimed companies listing
- Ownership-aware UI (Edit Profile button)

---

## 🧪 Known Working Functionality

- Login (Google + Email)
- Add company
- View companies list
- View company detail
- Claim company
- Edit company (owner)
- Profile creation/edit
- Public profile page

---

## ⚠️ Constraints / Rules

- Keep UI minimal (black & white)
- Avoid unnecessary libraries
- Do not over-engineer early
- Maintain clean folder structure
- Prefer simple logic over abstraction

---

## 📌 Current Features In Progress

- Linking company → owner profile UI
- Improving mobile responsiveness across pages

---

## 🧠 Claim Logic

- Extract domain from user email
- Normalize company domain
- Compare both
- If match → allow claim

Example:
user: john@stripe.com  
company: stripe.com → claim allowed

---

## 🧠 Profile System Logic

- Username is unique identity
- Stored in lowercase
- Public profile accessible via `/u/[username]`
- Profiles linked to companies via `claimed_by`

---

## 🎨 UI Principles

- Black & white theme
- Clean spacing
- Subtle borders
- Minimal interactions
- Typography-driven design

---

## 🔮 Future Roadmap (DO NOT BUILD YET)

### Data & Discovery
- Search companies
- Search users
- Filters (industry, country)

### Trust & Ownership
- Domain verification (email confirmation)
- Verified badge
- Admin moderation tools

### Product Expansion
- Company dashboards
- Contribution tracking
- External data enrichment (APIs)

---

## 📣 Instructions for AI (Cursor)

- Always read this file before coding
- Do not break existing features
- Keep UI consistent
- Follow schema strictly
- Avoid unnecessary complexity
- Explain plan before major changes
```

---

# 🧠 What changed (important)

You now have:

* Identity system documented ✅
* Public profiles included ✅
* Audit logs included ✅
* Real product flow defined ✅

---