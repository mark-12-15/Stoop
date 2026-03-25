# StoopKeep Documentation

**Project**: StoopKeep - Rental property repair management with Schedule E export  
**Slogan**: Keep every repair. Keep every receipt.

---

## 📁 Documentation Structure

This documentation is organized into two categories:

### 👤 for-review/ - Human Review Documentation
Documents that require human decision-making and approval.

```
for-review/
├── product/
│   └── strategy.md           # Market analysis, pricing strategy, competitive positioning
├── database.md               # Database schema (tables, fields, indexes, constraints)
├── state-machine.md          # Ticket status flow (NEW → IN_PROGRESS → CLOSED → ARCHIVED)
└── wireframes/               # UI/UX design for all pages (15 files)
    ├── 01-landing-page.md
    ├── 02-tenant-report.md
    ├── 03-login.md
    ├── 04-dashboard.md
    ├── 05-ticket-detail.md
    ├── 07-properties.md
    ├── 09-pricing.md
    ├── 10-mobile.md
    ├── 11-tickets-list.md
    ├── 12-manual-import.md
    ├── 13-reports.md
    ├── 14-feedback.md
    ├── 15-admin-dashboard.md
    └── README.md
```

**Purpose**: 
- Review business logic
- Validate user flows
- Approve UI/UX designs
- Verify data structure

---

### 🤖 for-ai/ - AI Reference Documentation
Technical references for AI-assisted development.

```
for-ai/
├── api-reference.md          # API endpoints (request/response, no implementation code)
├── tech-stack.md             # Technology choices (Next.js, Supabase, Gemini, etc.)
├── components.md             # UI component specs (buttons, modals, forms)
├── deployment.md             # Deployment guide (Vercel, environment variables)
└── gemini-prompts.md         # Gemini AI prompts (ticket analysis, receipt OCR)
```

**Purpose**: 
- Quick API lookup
- Technology reference
- Deployment checklist
- AI prompt templates

---

## 🎯 Quick Start

### For Product Review
1. Read `for-review/product/strategy.md` - Understand market positioning
2. Read `for-review/database.md` - Review data structure
3. Read `for-review/state-machine.md` - Understand ticket flow
4. Browse `for-review/wireframes/` - Review all page designs

### For Development
1. Read `for-ai/tech-stack.md` - Understand technology choices
2. Read `for-ai/api-reference.md` - API endpoints reference
3. Read `for-ai/deployment.md` - Setup environment
4. Read `for-ai/gemini-prompts.md` - AI integration

---

## 📊 Key Decisions

### Product
- **Target**: 5-15 property landlords (pain point: receipt management)
- **Pricing**: $30/month or $300/year (vs Stessa $336/year)
- **Differentiation**: Tenant submit via link (no login) + Schedule E export

### Technical
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase (PostgreSQL + Auth)
- **AI**: Gemini Flash 1.5 (photo analysis + receipt OCR)
- **Storage**: Cloudflare R2 (images and receipts)
- **Payments**: Lemon Squeezy

### Data Model
- **Core tables**: users, properties, tickets, feedback
- **Ticket statuses**: new → in_progress → pending_receipt → closed → archived
- **Expense types**: 13 types (repair, insurance, property_tax, utilities, etc.)

---

## 🚀 MVP Scope

### Phase 1 (Core)
1. Tenant submit ticket (via link, no login)
2. Landlord manage tickets (Dashboard, list, detail)
3. Manual add expense (support all 13 types)
4. Export Schedule E report

### Phase 2 (Enhancement)
5. Feedback system (anonymous + user)
6. Admin dashboard (users, properties, tickets, feedback)
7. CSV bulk import
8. Mobile responsive

### Phase 3 (Optional)
9. Email notifications
10. Gemini AI photo analysis
11. Receipt OCR
12. Multi-year reports

---

## 📖 How to Use This Documentation

### As a Human Reviewer
1. **Start with product strategy** to understand the "why"
2. **Review database design** to validate data structure
3. **Check wireframes** to approve UI/UX for each page
4. **Verify state machine** to ensure correct ticket flow

### As an AI Developer
1. **Read tech-stack.md** to understand tools
2. **Reference api-reference.md** when building endpoints
3. **Use gemini-prompts.md** for AI integration
4. **Follow deployment.md** for setup

### As a New Team Member
1. Read `for-review/product/strategy.md` first
2. Browse `for-review/wireframes/README.md` for page overview
3. Read `for-ai/tech-stack.md` for technical context
4. Start coding with `for-ai/api-reference.md` as reference

---

## 🔄 Document Updates

When making changes:
- **Product changes** → Update `for-review/product/strategy.md`
- **Database changes** → Update `for-review/database.md` + run migration
- **API changes** → Update `for-ai/api-reference.md`
- **UI changes** → Update corresponding wireframe file
- **Tech changes** → Update `for-ai/tech-stack.md`

---

## 📞 Questions?

- Product questions: Review `for-review/product/strategy.md`
- Technical questions: Check `for-ai/` files
- UI/UX questions: Browse `for-review/wireframes/`

---

**Last Updated**: 2024-03-25  
**Total Files**: 23 (18 for-review + 5 for-ai)  
**Total Lines**: ~11,100
