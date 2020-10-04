FROM buildkite/puppeteer:v1.15.0
COPY . .
RUN npm ci
ENTRYPOINT ["node", "dist/index.js"]