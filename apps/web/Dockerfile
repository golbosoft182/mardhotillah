# ---------- Build ----------
# ARG NODE_IMAGE memungkinkan override base image saat build
# (mis. node:20-alpine yang sudah ada di cache lokal ketika Docker Hub tidak terjangkau).
ARG NODE_IMAGE=node:22-alpine
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:3102
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3100
ARG NO_INDEX=false
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NO_INDEX=$NO_INDEX
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM ${NODE_IMAGE}
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
