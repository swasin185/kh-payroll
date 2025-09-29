# Setup

```bash
npm install -g npm@latest
pnpm create nuxt@latest $1 -- -t ui
cd $1
corepack use pnpm@latest
npx nuxi@latest module add auth-utils 
pnpm add crypto-js
pnpm add drizzle-orm
pnpm add mysql2
pnpm -D add tailwindcss
pnpm -D add @types/node
pnpm -D add @types/crypto-js
pnpm -D add vitest
pnpm approve-builds
```