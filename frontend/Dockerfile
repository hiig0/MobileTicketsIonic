FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY angular.json capacitor.config.ts ionic.config.json karma.conf.js tsconfig*.json .browserslistrc .eslintrc.json ./
COPY src ./src

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/www /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]