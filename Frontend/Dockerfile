### Frontend multi-stage Dockerfile
FROM node:18-alpine AS build
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci --silent

# copy sources and build (VITE_API_BASE must be provided as build arg)
COPY . .
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

### Production image
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
