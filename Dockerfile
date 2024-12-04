FROM node:18-alpine
WORKDIR /app
ENV PORT 5000
COPY . .
COPY .env .env
RUN npm install
EXPOSE 5000
CMD [ "npm", "run", "start"]