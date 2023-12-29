FROM node:18-alpine
RUN apk add --no-cache curl \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node
RUN apk add python3

# Everything for node canvas
RUN apk add --no-cache --virtual .build-deps \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    && apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman \
    pangomm \
    libjpeg-turbo \
    freetype \
    && rm -rf /var/cache/apk/*

WORKDIR /app
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
ENV NODE_ENV=production

COPY . .
RUN pnpm build

USER node

EXPOSE 3000
CMD ["pnpm", "start"]
