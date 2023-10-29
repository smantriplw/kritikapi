FROM docker.io/library/node:20.9.0-slim

RUN mkdir -p /app
COPY . /app
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        iputils-ping \
        procps \
        tzdata \
        curl \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
    && apt-get autoremove -y \
    && apt-get autoclean -y \
    && rm -rf /var/lib/apt/lists/*

RUN npm i -g pnpm
RUN pnpm i
RUN pnpm run build

EXPOSE 5130
CMD ["node", "./dist/index.js"]