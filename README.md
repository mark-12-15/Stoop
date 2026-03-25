# StoopKeep

> Keep every repair. Keep every receipt.

Rental property repair management with Schedule E export.

**开发模式**: Human + AI Collaborative Development 🤝

---

## 🎯 Product Overview

**Target**: US landlords with 5-15 properties  
**Value**: Tenant submit repairs → AI receipt OCR → Schedule E export  
**Pricing**: $12/month or $99/year (vs Stessa $336/year)

---

## 📚 Documentation

### For Humans 👤
- **Product Strategy**: `doc/for-review/product/strategy.md`
- **Database Design**: `doc/for-review/database.md`
- **Ticket Flow**: `doc/for-review/state-machine.md`
- **All Pages (15)**: `doc/for-review/wireframes/`

### For AI 🤖
- **Start Here**: `doc/DEV_GUIDE.md` - Development rules & guidelines
- **Task List**: `doc/TASKS.md` - Pick tasks from here
- **API Reference**: `doc/for-ai/api-reference.md`
- **Tech Stack**: `doc/for-ai/tech-stack.md`
- **Components**: `doc/for-ai/components.md`
- **Deployment**: `doc/for-ai/deployment.md`
- **Gemini Prompts**: `doc/for-ai/gemini-prompts.md`

### Quick Links
- **Full Documentation Index**: `doc/README.md`

---

## ⚡ Quick Start

### For Development (AI)
```bash
# 1. Read development guide
cat doc/DEV_GUIDE.md

# 2. Check task list
cat doc/TASKS.md

# 3. Pick a task and start coding
```

### For Human Review
```bash
# Review product strategy
cat doc/for-review/product/strategy.md

# Review database design
cat doc/for-review/database.md

# Review all page designs
ls doc/for-review/wireframes/
```

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Gemini Flash 1.5 (photo analysis + OCR)
- **Storage**: Cloudflare R2 (images)
- **Payments**: Lemon Squeezy
- **Deploy**: Vercel

---

## 📋 Development Status

See `doc/TASKS.md` for current progress.

**Pages to build**: 15  
**Environment setup**: Database + R2 + Gemini + Vercel

---

## 🤝 How AI Works

1. AI reads `doc/DEV_GUIDE.md` for rules
2. AI picks task from `doc/TASKS.md`
3. AI reads page design from `doc/for-review/wireframes/[page].md`
4. AI writes code (max 150 lines per file)
5. AI marks task complete, human reviews
6. Repeat until all tasks done

---

## 📞 Contact

For questions about this project, check the documentation first:
- Product: `doc/for-review/product/strategy.md`
- Technical: `doc/for-ai/`
- Development: `doc/DEV_GUIDE.md`