FROM node:14-alpine
WORKDIR /gamble-blamble
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app/index.js"]
