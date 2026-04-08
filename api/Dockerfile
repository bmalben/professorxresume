FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs \
  && chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
