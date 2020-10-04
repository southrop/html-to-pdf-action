FROM buildkite/puppeteer:v1.15.0
RUN npm ci
ENTRYPOINT ["node", "dist/index.js"]