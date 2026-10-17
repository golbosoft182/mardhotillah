# ---------- Build ----------
# ARG NODE_IMAGE memungkinkan override base image saat build
# (mis. node:20-alpine yang sudah ada di cache lokal ketika Docker Hub tidak terjangkau).
ARG NODE_IMAGE=node:22-alpine
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:3102
ARG ADMIN_BASE_PATH=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV ADMIN_BASE_PATH=$ADMIN_BASE_PATH
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
