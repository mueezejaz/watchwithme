FROM node:22-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --only=production
COPY server/ ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "index.js"]
