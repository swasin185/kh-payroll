FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm 

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]