FROM node:20-bullseye

RUN mkdir -p /app
COPY . /app
WORKDIR /app

RUN npm i -g pnpm
RUN pnpm i
RUN pnpm run build

EXPOSE 5130
CMD ["node", "./dist/index.js"]