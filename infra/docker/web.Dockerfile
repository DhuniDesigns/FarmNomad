FROM node:22-bookworm-slim AS deps
WORKDIR /workspace
COPY package.json package-lock.json* ./
COPY web/package.json ./web/package.json
RUN npm install

FROM deps AS build
COPY web ./web
WORKDIR /workspace/web
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /workspace/web/.next ./.next
COPY --from=build /workspace/web/public ./public
COPY --from=build /workspace/web/package.json ./package.json
COPY --from=deps /workspace/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
