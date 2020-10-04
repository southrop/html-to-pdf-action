FROM buildkite/puppeteer:v1.15.0
COPY dist/index.js /index.js
RUN npm ci
ENTRYPOINT ["node", "/index.js"]