FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json && npm install

COPY . .

# Vite env variables are injected at build time
ARG VITE_API_URL
ARG VITE_API_URL_ORDER
ARG VITE_DELIVERY_SERVICE_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_URL_ORDER=$VITE_API_URL_ORDER
ENV VITE_DELIVERY_SERVICE_URL=$VITE_DELIVERY_SERVICE_URL

RUN npm run build

FROM node:20-alpine
RUN npm install -g serve
COPY --from=build /app/dist /app/dist
WORKDIR /app
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]
