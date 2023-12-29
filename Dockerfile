FROM node:18-alpine
RUN apk add --no-cache curl \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node
RUN apk add python3

WORKDIR /app
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
ENV NODE_ENV=production

COPY . .
RUN pnpm build

USER node

EXPOSE 3000
CMD ["pnpm", "start"]
