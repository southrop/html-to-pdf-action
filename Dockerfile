FROM buildkite/puppeteer:v5.2.1
RUN npm ci
ENTRYPOINT ["node", "dist/index.js"]