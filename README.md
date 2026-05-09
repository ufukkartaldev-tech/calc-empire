# 🏛️ CalcEmpire

[![Code Quality](https://github.com/your-username/calc-empire/actions/workflows/code-quality.yml/badge.svg)](https://github.com/your-username/calc-empire/actions/workflows/code-quality.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)

**CalcEmpire** is an advanced, multilingual, and ultra-fast engineering calculators platform designed for engineers and students. It is built upon a modern software architecture and high-precision mathematical models.

---

## 🚀 Key Features

- **🌍 Multilingual Infrastructure:** 16+ languages supported (static type safety with next-intl).
- **🧪 TDD (Test-Driven Development):** 300+ test cases written with a 100% accuracy target.
- **🔗 Shareable State (URL State):** Instant sharing of calculation parameters via URL.
- **⚡ Modern Architecture:** Lightning-fast performance with React 19, Next.js 15, and Tailwind CSS v4.
- **📊 Visualization:** Interactive visualizers for Bode plots, beam deflection graphs, and resistor color codes.
- **🔍 Smart Search:** Advanced category-based tool search system powered by Fuse.js.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Next.js 15 (App Router), Tailwind CSS v4
- **Language:** TypeScript (Strict Type Safety)
- **State Management:** Zustand, URL State Sync
- **Testing:** Vitest, Playwright (E2E), Testing Library
- **Internationalization:** next-intl
- **Mathematics:** Big.js (High Precision), KaTeX (Formula Rendering)
- **Quality & Automation:** Husky, lint-staged, ESLint, Prettier

---

## 🏗️ Architectural Structure

The project is built on a **Modular Registry Pattern**. This makes adding a new calculation tool possible in just a few minutes:

1.  **UI Component:** `src/components/calculators/`
2.  **Configuration:** `src/lib/calculators/`
3.  **Solver:** `src/lib/calculators/` (Pure functions, 100% testable)
4.  **Registration:** `src/lib/calculators/registry.ts`

---

## 💻 Installation and Usage

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm

### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-username/calc-empire.git

# Navigate to the folder
cd calc-empire

# Install dependencies
npm install

# Start the development server
npm run dev
```
Access the application at `http://localhost:3000`.

---

## 🧪 Testing and Quality

In engineering calculations, the margin of error is unacceptable. Therefore, the project follows strict testing rules:

```bash
# Run unit tests (Vitest)
npm run test

# Run E2E tests (Playwright)
npm run test:e2e

# Check formatting
npm run format:check
```

For error margins and validation details, please review the [VALIDATION_REPORT.md](./docs/VALIDATION_REPORT.md) file.

---

## 🤝 Contributing

Looking to add a new tool or fix a bug?
1. Open a `feature` branch.
2. Write your tests first (TDD).
3. Develop your code.
4. Ensure `npm run lint` and `npm run test` commands pass.
5. Submit a Pull Request!

---

## 📜 License and Disclaimer

This project is licensed under the **MIT License**.

**⚠️ WARNING:** These tools are for educational purposes. For critical engineering decisions and official designs, please use licensed simulation software and obtain authorized engineering approval. No liability is accepted for any errors that may occur.

---
*Digitalizing engineering with CalcEmpire.*
