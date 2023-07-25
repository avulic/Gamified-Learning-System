# Choose the Image which has Node installed already
FROM node:18-alpine

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "dev" ]