FROM buildkite/puppeteer:v1.15.0
COPY . .
RUN npm ci
RUN ls
ENTRYPOINT ["node", "dist/index.js"]