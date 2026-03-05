# Stage 1: Build using quartz-base
FROM ghcr.io/freiha-org/quartz-base:latest AS builder
COPY . /usr/src/app/content/
RUN npx quartz build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /usr/src/app/public /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
