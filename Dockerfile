FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN mkdir -p .next/standalone/.next/static
RUN cp -r .next/static .next/standalone/.next/
RUN cp -r public .next/standalone/

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", ".next/standalone/server.js"]
