FROM node

WORKDIR /app/user_service

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8003

CMD ["npm", "start"]