FROM node

WORKDIR /app/quiz_service

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8003

CMD ["npm", "start"]