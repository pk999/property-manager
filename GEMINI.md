# Rental Property Management (RPM) - Project Context & Rules


```markdown
# GEMINI.md — Project Rules for Gym Manager PWA

---

## 2. General Development Rules & Guidelines

### Code Quality & Standards
- **Clean Code & Modularity**: Write self-documenting code with descriptive naming conventions. Keep components small, focused, and single-purpose.
- **Type Safety**: Maintain strict type definitions across data models, API responses, and UI component props.
- **Error Handling**: Implement explicit, graceful error handling with user-friendly error messages. Avoid swallowing exceptions or leaving unhandled promise rejections.
- **Security**: Never hardcode API keys, secrets, or credential tokens. Use environment variables (`.env`) for configuration.

### UI / UX & Design System
- **Modern Aesthetics**: Utilize modern visual elements (dynamic dark modes, sleek glassmorphism, tailored gradients, and vibrant accent colors).
- **Responsive Layout**: Design mobile-first and fluid interfaces compatible across desktop, tablet, and mobile displays.
- **Typography & Motion**: Use clean typography and micro-interactions/animations for actionable feedback.
- **Accessibility (a11y)**: Ensure proper ARIA attributes, semantic HTML elements, keyboard navigation, and visible focus states.

---

## 3. Project Workflow & AI Assistance Rules

1. **Context Retention**: Reference this file (`gemini.md`) for all build decisions, ensuring code patterns and architectural rules remain consistent across all feature additions.
2. **Step-by-Step Implementation**: Build features incrementally, verifying code syntax and runtime behavior after each milestone.
3. **No Placeholders**: Write fully working implementations with proper mock/real data instead of temporary placeholders.
4. **Documentation**: Keep code comments updated and maintain clear API interfaces.

## Safety & Execution Constraints
- NEVER execute destructive terminal commands without explicit, inline user confirmation.
- Restrict file modifications strictly to the GMS workspace boundaries.

# AI Agent Instructions & Coding Standards: Rental Property Management Micro-SaaS

## 1. Core Directives & Guardrails
* **Context Anchoring:** This file serves as the absolute source of truth. If you (the agent) experience context drift, code hallucination, or confusion regarding architecture, refer strictly to the database schema, security rules, and tech stack defined herein.
* **Target Audience Reality:** The end-users are non-technical local landlords in India managing commercial shops and residential houses. UI/UX must remain ultra-clean, mobile-first, and friction-free (zero complex menus, large tap targets, intuitive indicators).
* **Zero Infrastructure Cost Principle:** Maintain compatibility with free-tier limits (Vercel frontend hosting, Supabase free tier database/auth). Avoid introducing paid third-party dependencies or bloated frameworks unless explicitly requested.

---

## 2. Tech Stack Mandates
* **Frontend:** Next.js (App Router), Tailwind CSS, TypeScript.
* **UI Components:** Mobile-optimized, responsive layout with a Progressive Web App (PWA) manifest.
* **Backend & Database:** Supabase (PostgreSQL).
* **Authentication:** Supabase Auth with secure session cookies.

---

## 3. Strict Coding Standards & Best Practices

### A. Database & Data Integrity
* **Relational Integrity:** Never use NoSQL/document-store patterns for ledgers or tenants. Always maintain foreign key constraints (`landlord_id`, `property_id`) as defined in the schema.
* **Strict SQL & ORM Usage:** 
  * Always use the Supabase typed client SDK (`supabase.from('table').select()`) to automatically enforce parameterized queries and prevent SQL injection.
  * **Never** construct raw SQL strings via string interpolation or concatenation in application logic.

### B. Security & Multi-Tenancy (Non-Negotiable)
* **Row-Level Security (RLS):** Every table created must have RLS enabled with policies tied strictly to `auth.uid()`. 
* **IDOR Prevention:** Never expose endpoints or queries that fetch records without validating ownership through the database layer. Cross-tenant data leaks are a critical failure.
* **Environment Variables:** Never hardcode API keys or connection strings. Use secure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` if used server-side only).

### C. Frontend & State Management
* **TypeScript Strictness:** Avoid `any` types. Define explicit interfaces or types for all data models (`Landlord`, `Property`, `Tenant`, `MonthlyLedger`).
* **Error Handling:** Gracefully handle network failures and database errors with user-friendly toast messages or clean fallback UI states on mobile screens.
* **WhatsApp Integration Standard:** All WhatsApp reminder buttons must cleanly format and encode text strings into standard click-to-chat URL schemas:
  `https://wa.me/[phone_number]?text=[encodeURIComponent(message)]`

---

