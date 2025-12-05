FROM nginx:stable-alpine

# Copy the pre-built app (assumes you have run `npm run build` in ./client)
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
