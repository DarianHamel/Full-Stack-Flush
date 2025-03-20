FROM node:20

WORKDIR /usr/src/app

COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY package*.json ./

RUN npm ci

RUN cd server && npm ci

RUN cd client && npm ci

COPY . .

RUN cd client && npm run build

RUN npm install -g serve

EXPOSE 5050  
EXPOSE 5173  

CMD ["sh", "-c", "cd server && npm start & serve -s client/dist -l 5173"]
